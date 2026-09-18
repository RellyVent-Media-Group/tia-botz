import { pendingMigrations } from "../../scripts/migration-plan.mjs";

/** Which database backend is active. */
export type DbSource = "neon" | "pglite" | "sqlite" | "supabase";

// An empty/whitespace DATABASE_URL (an easy misconfig in deploy UIs) must mean
// "unset" — otherwise production would silently run on the PGLite fallback.
const rawDatabaseUrl =
  typeof process !== "undefined" ? process.env.DATABASE_URL : undefined;
const databaseUrl =
  rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : undefined;

const rawSqlitePath =
  typeof process !== "undefined" ? process.env.SQLITE_PATH : undefined;
const sqlitePath =
  rawSqlitePath && rawSqlitePath.trim() ? rawSqlitePath : undefined;

const rawSupabaseUrl =
  typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined;
const supabaseUrl =
  rawSupabaseUrl && rawSupabaseUrl.trim() ? rawSupabaseUrl : undefined;

const rawSupabaseAnonKey =
  typeof process !== "undefined" ? process.env.SUPABASE_ANON_KEY : undefined;
const supabaseAnonKey =
  rawSupabaseAnonKey && rawSupabaseAnonKey.trim() ? rawSupabaseAnonKey : undefined;

const rawSupabaseServiceKey =
  typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;
const supabaseServiceKey =
  rawSupabaseServiceKey && rawSupabaseServiceKey.trim() ? rawSupabaseServiceKey : undefined;

/**
 * Active backend selection based on environment variables:
 * - **Supabase** when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
 * - **Neon** when `DATABASE_URL` is set (deployed / configured sandbox)
 * - **SQLite** when `SQLITE_PATH` is set (local SQLite file)
 * - **PGLite** fallback (Postgres compiled to WASM) for preview/no config
 */
export const dbSource: DbSource = supabaseUrl && supabaseAnonKey
  ? "supabase"
  : databaseUrl
    ? "neon"
    : sqlitePath
      ? "sqlite"
      : "pglite";

/**
 * Minimal shared SQL surface, satisfied by Neon, PGLite, SQLite, and Supabase.
 * Both the tagged-template and `.query()` forms resolve to an array of row objects:
 *
 *   const sql = await getSql();
 *   const rows = await sql`select * from todos where id = ${id}`; // parameterized
 *   const rows2 = await sql.query("select * from todos where id = $1", [id]);
 */
export interface Sql {
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
}

/**
 * Init state lives on globalThis as promises: dev HMR creates new instances of
 * this module, and two instances racing module-level state would open a second
 * pool or run two concurrent PGLite migration passes (whose duplicate
 * `_migrations` insert rejects — and would get memoized, poisoning every later
 * `getSql()`). A failed init clears its slot so the next call retries.
 */
const globalRef = globalThis as typeof globalThis & {
  __pgSqlPromise__?: Promise<Sql>;
  __pgliteInstance__?: Promise<import("@electric-sql/pglite").PGlite>;
  __pgliteMigrateChain__?: Promise<void>;
  __sqliteInstance__?: Promise<any>;
  __sqliteMigrateChain__?: Promise<void>;
};

/**
 * Result-type parity: Postgres sends every value as text plus a type OID — the
 * JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
 * int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
 * JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
 * production return identical, JSON-safe shapes:
 *   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
 *                                   `::text` if you ever need huge integers)
 *   date                         -> 'YYYY-MM-DD' string
 *   interval                     -> Postgres interval text
 * numeric already comes back as a string on both (arbitrary precision).
 */
const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;
const identity = (v: string) => v;

type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    // Rebuild with $1, $2, … placeholders so values stay parameterized.
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    run<T>(text, params);
  return sql;
}

function createNeonSql(): Promise<Sql> {
  globalRef.__pgSqlPromise__ ??= (async () => {
    // Regular Postgres driver: node-postgres (`pg`) — works directly with Neon's
    // pooled endpoint and Supabase. One pool per process; warm serverless instances reuse it.
    const { Pool, types } = await import("pg");
    types.setTypeParser(OID_INT8, Number);
    types.setTypeParser(OID_DATE, identity);
    types.setTypeParser(OID_INTERVAL, identity);
    
    // Use Supabase connection if available, otherwise fall back to DATABASE_URL
    const connectionString = dbSource === "supabase" 
      ? `${supabaseUrl}?pgbouncer=true` // Use connection pooling for Supabase
      : databaseUrl;
    
    const pool = new Pool({ 
      connectionString,
      // For Supabase, use service role key for server-side operations
      ...(dbSource === "supabase" && supabaseServiceKey ? {
        password: supabaseServiceKey
      } : {})
    });
    return toSql(async <T>(text: string, params: unknown[]) => {
      const res = await pool.query(text, params);
      return res.rows as T[];
    });
  })().catch((err) => {
    globalRef.__pgSqlPromise__ = undefined;
    throw err;
  });
  return globalRef.__pgSqlPromise__;
}

async function createPgliteSql(): Promise<Sql> {
  // Embedded Postgres, imported on demand so it never loads on the Neon path.
  // One in-memory instance per process, shared across HMR module instances, so
  // data survives source edits (it resets on dev-server restart).
  globalRef.__pgliteInstance__ ??= (async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const pg = new PGlite({
      parsers: {
        [OID_INT8]: Number,
        [OID_DATE]: identity,
        [OID_INTERVAL]: identity,
      },
    });
    await pg.waitReady;
    await pg.exec(
      "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    return pg;
  })().catch((err) => {
    globalRef.__pgliteInstance__ = undefined;
    throw err;
  });
  const pg = await globalRef.__pgliteInstance__;

  // Apply migrations/ (the single schema source) so preview matches production.
  // SQL is inlined by the bundler via import.meta.glob (no runtime fs); applied
  // files are tracked in _migrations. The glob does not descend, so the opt-in
  // auth schema under migrations/auth/ stays out. Runs once per module instance
  // — so an HMR reload after adding a migration file applies it live — with
  // passes serialized on a global chain so concurrent callers never
  // double-apply.
  const migrate = async (): Promise<void> => {
    const migrations = import.meta.glob("/migrations/*.sql", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    const doneRows = await pg.query<{ name: string }>(
      "select name from _migrations",
    );
    const done = doneRows.rows.map((r) => r.name);
    for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) {
      // Apply + record atomically (parity with scripts/migrate.mjs) so a failed
      // statement can't leave a file half-applied but untracked.
      await pg.transaction(async (tx) => {
        await tx.exec(migrations[path]);
        await tx.query("insert into _migrations (name) values ($1)", [name]);
      });
    }
  };
  const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve())
    .catch(() => undefined) // an earlier failed pass must not wedge the chain
    .then(migrate);
  globalRef.__pgliteMigrateChain__ = pass;
  await pass;

  return toSql(async <T>(text: string, params: unknown[]) => {
    const result = await pg.query<T>(text, params);
    return result.rows;
  });
}

async function createSqliteSql(): Promise<Sql> {
  // SQLite database using better-sqlite3 for local file-based storage.
  // Converts Postgres SQL to SQLite syntax where needed.
  globalRef.__sqliteInstance__ ??= (async () => {
    const Database = await import("better-sqlite3");
    const db = new Database.default(sqlitePath || ":memory:");
    
    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");
    
    // Create migrations table
    db.exec(
      "create table if not exists _migrations (name text primary key, applied_at text not null default current_timestamp)"
    );
    return db;
  })().catch((err) => {
    globalRef.__sqliteInstance__ = undefined;
    throw err;
  });
  const db = await globalRef.__sqliteInstance__;

  // Apply migrations with Postgres to SQLite syntax conversion
  const migrate = async (): Promise<void> => {
    const migrations = import.meta.glob("/migrations/*.sql", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    
    const doneRows = db.prepare("select name from _migrations").all() as { name: string }[];
    const done = doneRows.map((r) => r.name);
    
    for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) {
      const sql = migrations[path];
      // Convert Postgres syntax to SQLite
      const sqliteSql = convertPostgresToSQLite(sql);
      
      // Apply migration within transaction
      const applyMigration = db.transaction(() => {
        db.exec(sqliteSql);
        db.prepare("insert into _migrations (name) values (?)").run(name);
      });
      
      try {
        applyMigration();
      } catch (err) {
        console.error(`Migration ${name} failed:`, err);
        throw err;
      }
    }
  };
  
  const pass = (globalRef.__sqliteMigrateChain__ ?? Promise.resolve())
    .catch(() => undefined)
    .then(migrate);
  globalRef.__sqliteMigrateChain__ = pass;
  await pass;

  return toSql(async <T>(text: string, params: unknown[]) => {
    // Convert Postgres placeholders ($1, $2) to SQLite placeholders (?, ?)
    const sqliteText = text.replace(/\$(\d+)/g, (_, index) => "?");
    const stmt = db.prepare(sqliteText);
    const result = stmt.all(...params) as T[];
    return result;
  });
}

// Simple Postgres to SQLite syntax converter
function convertPostgresToSQLite(sql: string): string {
  return sql
    // Replace Postgres placeholders with SQLite placeholders
    .replace(/\$(\d+)/g, "?")
    // Replace Postgres-specific types with SQLite equivalents
    .replace(/\bserial\b/gi, "integer")
    .replace(/\bbigserial\b/gi, "integer")
    .replace(/\btext\b/gi, "text")
    .replace(/\btimestamptz\b/gi, "text")
    .replace(/\btimestamp\b/gi, "text")
    .replace(/\bboolean\b/gi, "integer")
    .replace(/\bjsonb?\b/gi, "text")
    .replace(/\buuid\b/gi, "text")
    // Replace Postgres-specific functions
    .replace(/\bnow\(\)/gi, "datetime('now')")
    .replace(/\bcurrent_timestamp\b/gi, "datetime('now')")
    .replace(/\btrue\b/gi, "1")
    .replace(/\bfalse\b/gi, "0")
    // Remove Postgres-specific clauses
    .replace(/\bdeferrable\b/gi, "")
    .replace(/\binitially deferred\b/gi, "")
    .replace(/\bdeferrable initially deferred\b/gi, "")
    // Handle RETURNING clause (SQLite doesn't support it in the same way)
    .replace(/\breturning\b.*$/gim, "");
}

let sqlPromise: Promise<Sql> | null = null;

async function createSql(): Promise<Sql> {
  if (typeof window !== "undefined") {
    throw new Error(
      "@/lib/db is server-only — call getSql() from a createServerFn handler " +
        "or a server route loader, never from client code.",
    );
  }
  switch (dbSource) {
    case "neon":
      return createNeonSql();
    case "pglite":
      return createPgliteSql();
    case "sqlite":
      return createSqliteSql();
    case "supabase":
      return createNeonSql(); // Supabase uses Postgres protocol
    default:
      throw new Error(`Unknown database source: ${dbSource}`);
  }
}

/**
 * Get the shared, **server-only** SQL client. Supports multiple backends:
 * - Supabase when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
 * - Neon when `DATABASE_URL` is set
 * - SQLite when `SQLITE_PATH` is set
 * - PGLite fallback (embedded Postgres) for preview/no config
 * Memoized — safe to call per request.
 *
 * Schema comes from `migrations/*.sql`, auto-applied before the first query on
 * all backends — define tables there, never inline in server functions.
 */
export function getSql(): Promise<Sql> {
  sqlPromise ??= createSql().catch((err) => {
    sqlPromise = null; // don't memoize failures — let the next call retry
    throw err;
  });
  return sqlPromise;
}

/**
 * The shared PGLite instance (preview only), with `migrations/*.sql` applied.
 * Lets Better Auth persist to the SAME embedded DB as app data in preview (via a
 * Kysely dialect). Throws when `DATABASE_URL` is set (that path uses Neon).
 */
export async function getPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  if (dbSource !== "pglite") {
    throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
  }
  await getSql();
  const pg = await globalRef.__pgliteInstance__;
  if (!pg) throw new Error("PGLite instance failed to initialize");
  return pg;
}

/**
 * The shared SQLite instance, with `migrations/*.sql` applied.
 * Lets Better Auth persist to the SAME SQLite database as app data (via a
 * Kysely dialect). Throws when SQLite is not the active backend.
 */
export async function getSqlite(): Promise<any> {
  if (dbSource !== "sqlite") {
    throw new Error("getSqlite() is only available when SQLite is the active backend");
  }
  await getSql();
  const db = await globalRef.__sqliteInstance__;
  if (!db) throw new Error("SQLite instance failed to initialize");
  return db;
}

/**
 * Finish DB bootstrap before the server handles traffic.
 *
 * - **PGLite** (preview / no config): open the in-memory DB and apply
 *   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
 * - **SQLite** (local file): open the SQLite database and apply migrations.
 * - **Neon/Supabase**: no-op (pool is created lazily on first query).
 *
 * Vite `configureServer` awaits this at dev startup; production imports of this
 * module kick it off immediately (see bottom of file).
 */
export function ensureDbReady(): Promise<void> {
  if (dbSource === "pglite" || dbSource === "sqlite") {
    return getSql().then(() => undefined);
  }
  return Promise.resolve();
}

// Server-only eager start: kick PGLite/SQLite bootstrap as soon as this module loads in
// Node. Client bundles never hit this path (`getSql` throws in the browser).
const globalBoot = globalThis as typeof globalThis & {
  __pgBootstrapPromise__?: Promise<void>;
};
if (typeof window === "undefined" && (dbSource === "pglite" || dbSource === "sqlite")) {
  globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
    globalBoot.__pgBootstrapPromise__ = undefined;
    console.error(`[db] ${dbSource} bootstrap failed:`, err);
    throw err;
  });
}
