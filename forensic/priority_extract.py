#!/usr/bin/env python3
"""Priority macOS forensic extractor.

Collects a small, high-value set of local artifacts into a timestamped
directory and keeps a stable ~/Desktop/Forensic_Extract symlink pointing at
the newest run when possible.
"""

import argparse
import csv
import hashlib
import json
import os
import platform
import shutil
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

MEDIA_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".heic", ".webp", ".bmp", ".tif", ".tiff",
    ".mp4", ".mov", ".m4v", ".mp3", ".m4a", ".aac", ".wav", ".ogg", ".caf",
    ".pdf", ".zip", ".vcf",
}

WHATSAPP_MESSAGE_QUERY = """
SELECT
    m.Z_PK AS message_id,
    datetime(m.ZMESSAGEDATE + 978307200, 'unixepoch') AS message_timestamp,
    COALESCE(s.ZPARTNERNAME, s.ZCONTACTJID, m.ZTOJID, m.ZFROMJID) AS chat,
    s.ZCONTACTJID AS chat_jid,
    m.ZTEXT AS text,
    m.ZISFROMME AS is_from_me,
    m.ZMESSAGETYPE AS message_type,
    m.ZMESSAGESTATUS AS message_status,
    m.ZSTANZAID AS stanza_id,
    m.ZMEDIAITEM AS media_item_id
FROM ZWAMESSAGE m
LEFT JOIN ZWACHATSESSION s ON s.Z_PK = m.ZCHATSESSION
ORDER BY m.ZMESSAGEDATE DESC
"""

WHATSAPP_SESSION_QUERY = """
SELECT
    Z_PK AS session_id,
    ZCONTACTJID AS contact_jid,
    ZPARTNERNAME AS partner_name,
    ZLASTMESSAGETEXT AS last_message_text,
    datetime(ZLASTMESSAGEDATE + 978307200, 'unixepoch') AS last_message_timestamp,
    ZMESSAGECOUNTER AS message_count,
    ZUNREADCOUNT AS unread_count,
    ZSESSIONTYPE AS session_type,
    ZARCHIVED AS archived,
    ZHIDDEN AS hidden,
    ZREMOVED AS removed
FROM ZWACHATSESSION
ORDER BY ZLASTMESSAGEDATE DESC
"""

WHATSAPP_MEDIA_QUERY = """
SELECT
    Z_PK AS media_id,
    ZMESSAGE AS message_id,
    ZTITLE AS title,
    ZMEDIALOCALPATH AS local_path,
    ZMEDIAURL AS media_url,
    ZFILESIZE AS file_size,
    datetime(ZMEDIAURLDATE + 978307200, 'unixepoch') AS media_timestamp,
    ZTHUMBNAILLOCALPATH AS thumbnail_path,
    ZVCARDNAME AS vcard_name,
    ZVCARDSTRING AS vcard_string
FROM ZWAMEDIAITEM
ORDER BY ZMEDIAURLDATE DESC
"""

WHATSAPP_PROFILE_QUERY = """
SELECT ZJID AS jid, ZPUSHNAME AS push_name
FROM ZWAPROFILEPUSHNAME
ORDER BY ZJID
"""

IMESSAGE_QUERY = """
SELECT
    m.ROWID AS message_id,
    datetime(m.date / 1000000000 + 978307200, 'unixepoch') AS timestamp,
    COALESCE(h.id, '') AS handle,
    m.text AS text,
    m.is_from_me,
    m.service,
    m.cache_roomnames AS chat_identifier
FROM message m
LEFT JOIN handle h ON h.ROWID = m.handle_id
WHERE lower(COALESCE(m.text, '')) LIKE '%whatsapp%'
   OR lower(COALESCE(m.text, '')) LIKE '%wa.me%'
   OR lower(COALESCE(m.text, '')) LIKE '%web.whatsapp%'
ORDER BY m.date DESC
"""

CRUSH_TABLES = ("sessions", "messages", "files", "read_files")

NOTES_METADATA_QUERY = """
SELECT
    Z_PK AS object_id,
    ZTITLE1 AS title,
    ZSNIPPET AS snippet,
    datetime(ZCREATIONDATE1 + 978307200, 'unixepoch') AS created,
    datetime(ZMODIFICATIONDATE1 + 978307200, 'unixepoch') AS modified,
    ZTYPE AS object_type,
    ZFOLDER AS folder_id,
    ZNOTE AS note_id,
    ZNOTEDATA AS note_data_id,
    ZFILESIZE AS file_size
FROM ZICCLOUDSYNCINGOBJECT
WHERE ZTITLE1 IS NOT NULL
   OR ZSNIPPET IS NOT NULL
   OR ZNOTE IS NOT NULL
   OR ZNOTEDATA IS NOT NULL
ORDER BY Z_PK
"""


def iso_now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def cell_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        try:
            return value.decode("utf-8")
        except UnicodeDecodeError:
            return value.hex()
    return str(value)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def snapshot_sqlite(source: Path, destination: Path) -> Dict:
    """Create a consistent SQLite snapshot, falling back to file copies."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    for suffix in ("", "-wal", "-shm"):
        sidecar = Path(str(destination) + suffix)
        if sidecar.exists():
            sidecar.unlink()

    try:
        source_uri = source.resolve().as_uri() + "?mode=ro"
        source_db = sqlite3.connect(source_uri, uri=True)
        target_db = sqlite3.connect(str(destination))
        try:
            source_db.backup(target_db, pages=1000)
        finally:
            target_db.close()
            source_db.close()
        method = "sqlite_backup"
    except Exception:
        method = "file_copy"
        shutil.copy2(source, destination)
        for suffix in ("-wal", "-shm"):
            sidecar = Path(str(source) + suffix)
            if sidecar.exists():
                shutil.copy2(sidecar, Path(str(destination) + suffix))

    return {
        "source": str(source),
        "destination": str(destination),
        "method": method,
        "size": destination.stat().st_size if destination.exists() else 0,
        "sha256": sha256_file(destination) if destination.exists() else None,
        "status": "copied",
    }


def copy_file(source: Path, destination: Path) -> Dict:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        destination.unlink()
    shutil.copy2(source, destination)
    return {
        "source": str(source),
        "destination": str(destination),
        "method": "file_copy",
        "size": destination.stat().st_size,
        "sha256": sha256_file(destination),
        "status": "copied",
    }


def table_exists(connection: sqlite3.Connection, table: str) -> bool:
    row = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?",
        (table,),
    ).fetchone()
    return row is not None


def export_query(
    database: Path,
    output: Path,
    query: str,
    fallback_query: Optional[str] = None,
) -> int:
    connection = sqlite3.connect(str(database))
    try:
        try:
            cursor = connection.execute(query)
        except sqlite3.Error:
            if fallback_query is None:
                raise
            cursor = connection.execute(fallback_query)
        columns = [description[0] for description in cursor.description or []]
        output.parent.mkdir(parents=True, exist_ok=True)
        rows = 0
        with output.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(columns)
            for row in cursor:
                writer.writerow([cell_text(value) for value in row])
                rows += 1
        return rows
    finally:
        connection.close()


def export_database_artifacts(
    extract_dir: Path,
    records: List[Dict],
    warnings: List[str],
) -> List[Dict]:
    exports: List[Dict] = []
    database_dir = extract_dir / "databases"
    export_dir = extract_dir / "exports"

    def db_path(relative: str) -> Path:
        return database_dir / relative

    whatsapp_db = db_path("whatsapp/ChatStorage.sqlite")
    whatsapp_exports = [
        ("whatsapp_messages.csv", WHATSAPP_MESSAGE_QUERY, "SELECT * FROM ZWAMESSAGE"),
        ("whatsapp_chat_sessions.csv", WHATSAPP_SESSION_QUERY, "SELECT * FROM ZWACHATSESSION"),
        ("whatsapp_media_items.csv", WHATSAPP_MEDIA_QUERY, "SELECT * FROM ZWAMEDIAITEM"),
        ("whatsapp_profile_names.csv", WHATSAPP_PROFILE_QUERY, "SELECT * FROM ZWAPROFILEPUSHNAME"),
    ]
    if whatsapp_db.exists():
        connection = sqlite3.connect(str(whatsapp_db))
        try:
            available = {
                row[0]
                for row in connection.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'"
                )
            }
        finally:
            connection.close()
        for filename, query, fallback in whatsapp_exports:
            table = {
                "whatsapp_messages.csv": "ZWAMESSAGE",
                "whatsapp_chat_sessions.csv": "ZWACHATSESSION",
                "whatsapp_media_items.csv": "ZWAMEDIAITEM",
                "whatsapp_profile_names.csv": "ZWAPROFILEPUSHNAME",
            }[filename]
            if table not in available:
                exports.append({"file": filename, "rows": 0, "status": "skipped_missing_table"})
                continue
            try:
                rows = export_query(whatsapp_db, export_dir / filename, query, fallback)
                exports.append({"file": filename, "rows": rows, "status": "exported"})
            except Exception as exc:
                warnings.append(f"WhatsApp export {filename} failed: {exc}")
                exports.append({"file": filename, "rows": 0, "status": "failed", "error": str(exc)})
    else:
        exports.append({"file": "whatsapp_messages.csv", "rows": 0, "status": "skipped_missing_database"})

    imessage_db = db_path("imessage/chat.db")
    if imessage_db.exists():
        try:
            rows = export_query(
                imessage_db,
                export_dir / "imessage_whatsapp_mentions.csv",
                IMESSAGE_QUERY,
                "SELECT ROWID, * FROM message",
            )
            exports.append({"file": "imessage_whatsapp_mentions.csv", "rows": rows, "status": "exported"})
        except Exception as exc:
            warnings.append(f"iMessage export failed: {exc}")
            exports.append({"file": "imessage_whatsapp_mentions.csv", "rows": 0, "status": "failed", "error": str(exc)})

    notes_db = db_path("notes/NoteStore.sqlite")
    if notes_db.exists():
        try:
            connection = sqlite3.connect(str(notes_db))
            has_metadata = table_exists(connection, "ZICCLOUDSYNCINGOBJECT")
            connection.close()
            if has_metadata:
                rows = export_query(
                    notes_db,
                    export_dir / "notes_metadata.csv",
                    NOTES_METADATA_QUERY,
                )
                exports.append({"file": "notes_metadata.csv", "rows": rows, "status": "exported"})
            else:
                exports.append({"file": "notes_metadata.csv", "rows": 0, "status": "skipped_missing_table"})
        except Exception as exc:
            warnings.append(f"Notes metadata export failed: {exc}")
            exports.append({"file": "notes_metadata.csv", "rows": 0, "status": "failed", "error": str(exc)})

    crush_root = database_dir / "crush"
    if crush_root.is_dir():
        for crush_db in sorted(crush_root.glob("*/crush.db")):
            slug = crush_db.parent.name
            try:
                connection = sqlite3.connect(str(crush_db))
                available = {
                    row[0]
                    for row in connection.execute(
                        "SELECT name FROM sqlite_master WHERE type='table'"
                    )
                }
                connection.close()
            except Exception as exc:
                warnings.append(f"Crush DB {crush_db} unreadable: {exc}")
                continue
            for table in CRUSH_TABLES:
                filename = f"crush_{slug}_{table}.csv"
                if table not in available:
                    exports.append({"file": filename, "rows": 0, "status": "skipped_missing_table"})
                    continue
                try:
                    rows = export_query(crush_db, export_dir / filename, f"SELECT * FROM {table}")
                    exports.append({"file": filename, "rows": rows, "status": "exported"})
                except Exception as exc:
                    warnings.append(f"Crush export {filename} failed: {exc}")
                    exports.append({"file": filename, "rows": 0, "status": "failed", "error": str(exc)})

    return exports


def iter_files(root: Path) -> Iterable[Path]:
    for current, _dirs, files in os.walk(root):
        for filename in files:
            yield Path(current) / filename


def inventory_media(
    home: Path,
    extract_dir: Path,
    max_files: int,
) -> Dict:
    whatsapp_root = home / "Library" / "Group Containers" / "group.net.whatsapp.WhatsApp.shared"
    targets = [
        ("whatsapp_message_media", whatsapp_root / "Message" / "Media", False),
        ("whatsapp_shared_media", whatsapp_root / "Media", False),
        ("imessage_attachments", home / "Library" / "Messages" / "Attachments", True),
        ("notes_group_media", home / "Library" / "Group Containers" / "group.com.apple.notes" / "Media", True),
    ]

    output = extract_dir / "inventory" / "media_files.csv"
    output.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    truncated = False
    sources_seen = []

    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["source", "path", "size", "modified", "extension"])
        for source_name, root, require_media_extension in targets:
            if not root.exists():
                continue
            sources_seen.append(str(root))
            for path in iter_files(root):
                if require_media_extension and path.suffix.lower() not in MEDIA_EXTENSIONS:
                    continue
                try:
                    stat = path.stat()
                except OSError:
                    continue
                writer.writerow([
                    source_name,
                    str(path),
                    stat.st_size,
                    datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
                    path.suffix.lower(),
                ])
                count += 1
                if count >= max_files:
                    truncated = True
                    break
            if truncated:
                break

    return {
        "csv": str(output),
        "files": count,
        "truncated": truncated,
        "max_files": max_files,
        "sources": sources_seen,
    }


def write_system_info(extract_dir: Path, home: Path) -> Path:
    path = extract_dir / "system_info.txt"
    lines = [
        f"generated_at={iso_now()}",
        f"platform={platform.platform()}",
        f"python={sys.version.split()[0]}",
        f"home={home}",
        f"user={os.environ.get('USER', '')}",
    ]
    try:
        uname = subprocess.run(["uname", "-a"], capture_output=True, text=True, timeout=5)
        if uname.returncode == 0:
            lines.append(f"uname={uname.stdout.strip()}")
    except Exception:
        pass
    if sys.platform == "darwin":
        try:
            sw_vers = subprocess.run(["sw_vers"], capture_output=True, text=True, timeout=5)
            if sw_vers.returncode == 0:
                lines.extend(sw_vers.stdout.strip().splitlines())
        except Exception:
            pass
        try:
            model = subprocess.run(["sysctl", "-n", "hw.model"], capture_output=True, text=True, timeout=5)
            if model.returncode == 0:
                lines.append(f"hardware_model={model.stdout.strip()}")
        except Exception:
            pass
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def find_crush_state_dirs(home: Path) -> List[Path]:
    """Locate project-level .crush state directories (Crush CLI sessions)."""
    candidates = [Path.cwd() / ".crush"]
    desktop = home / "Desktop"
    if desktop.is_dir():
        try:
            candidates.extend(sorted(desktop.glob("*/.crush")))
        except OSError:
            pass
    found: List[Path] = []
    seen = set()
    for candidate in candidates:
        try:
            resolved = candidate.resolve()
        except OSError:
            continue
        if resolved in seen or not (resolved / "crush.db").exists():
            continue
        seen.add(resolved)
        found.append(resolved)
    return found


def database_specs(home: Path, include_sensitive: bool) -> List[Dict]:
    whatsapp = home / "Library" / "Group Containers" / "group.net.whatsapp.WhatsApp.shared"
    messages = home / "Library" / "Messages"
    notes_group = home / "Library" / "Group Containers" / "group.com.apple.notes"
    notes_container = home / "Library" / "Containers" / "com.apple.Notes" / "Data" / "Library" / "Notes"

    specs = [
        {"key": "whatsapp_chat_storage", "source": whatsapp / "ChatStorage.sqlite", "destination": "databases/whatsapp/ChatStorage.sqlite", "kind": "sqlite"},
        {"key": "whatsapp_contacts", "source": whatsapp / "ContactsV2.sqlite", "destination": "databases/whatsapp/ContactsV2.sqlite", "kind": "sqlite"},
        {"key": "whatsapp_call_history", "source": whatsapp / "CallHistory.sqlite", "destination": "databases/whatsapp/CallHistory.sqlite", "kind": "sqlite"},
        {"key": "whatsapp_lid_map", "source": whatsapp / "LID.sqlite", "destination": "databases/whatsapp/LID.sqlite", "kind": "sqlite"},
        {"key": "whatsapp_labels", "source": whatsapp / "Labels.sqlite", "destination": "databases/whatsapp/Labels.sqlite", "kind": "sqlite"},
        {"key": "whatsapp_ext_chat_db", "source": whatsapp / "ExtChatDB" / "ExtChatDatabase.sqlite", "destination": "databases/whatsapp/ExtChatDatabase.sqlite", "kind": "sqlite"},
        {"key": "whatsapp_messaging_infra_db", "source": whatsapp / "MessagingInfraDB_v2" / "MessagingInfraDatabase.sqlite", "destination": "databases/whatsapp/MessagingInfraDatabase.sqlite", "kind": "sqlite"},
        {"key": "imessage_chat_db", "source": messages / "chat.db", "destination": "databases/imessage/chat.db", "kind": "sqlite"},
        {"key": "notes_store", "source": notes_group / "NoteStore.sqlite", "destination": "databases/notes/NoteStore.sqlite", "kind": "sqlite"},
        {"key": "notes_legacy_store", "source": notes_container / "NotesV7.storedata", "destination": "databases/notes/NotesV7.storedata", "kind": "sqlite"},
    ]

    crush_dirs = find_crush_state_dirs(home)
    for index, crush_dir in enumerate(crush_dirs, start=1):
        slug = "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in crush_dir.parent.name) or f"dir{index}"
        specs.append({
            "key": f"crush_db_{slug}",
            "source": crush_dir / "crush.db",
            "destination": f"databases/crush/{slug}/crush.db",
            "kind": "sqlite",
        })
        log_file = crush_dir / "logs" / "crush.log"
        if log_file.exists():
            specs.append({
                "key": f"crush_log_{slug}",
                "source": log_file,
                "destination": f"databases/crush/{slug}/crush.log",
                "kind": "file",
            })

    if include_sensitive:
        specs.extend([
            {"key": "whatsapp_axolotl", "source": whatsapp / "Axolotl.sqlite", "destination": "databases/whatsapp/Axolotl.sqlite", "kind": "sqlite", "sensitive": True},
            {"key": "whatsapp_local_key_value", "source": whatsapp / "LocalKeyValue.sqlite", "destination": "databases/whatsapp/LocalKeyValue.sqlite", "kind": "sqlite", "sensitive": True},
            {"key": "whatsapp_enc_key", "source": whatsapp / "enc-key.dat", "destination": "databases/whatsapp/enc-key.dat", "kind": "file", "sensitive": True},
        ])
    return specs


def resolve_output_dir(home: Path, requested: Optional[str]) -> Path:
    desktop = home / "Desktop"
    desktop.mkdir(parents=True, exist_ok=True)
    if requested:
        path = Path(requested).expanduser()
        if not path.is_absolute():
            path = Path.cwd() / path
        path.mkdir(parents=True, exist_ok=True)
        return path.resolve()

    stable = desktop / "Forensic_Extract"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    candidate = desktop / f"Forensic_Extract_{timestamp}"
    if candidate.exists():
        candidate = desktop / f"Forensic_Extract_{timestamp}_{os.getpid()}"

    if stable.is_symlink():
        stable.unlink()
        candidate.mkdir(parents=True, exist_ok=False)
        os.symlink(candidate, stable)
        return candidate
    if stable.exists():
        stable.mkdir(parents=True, exist_ok=True)
        return stable

    candidate.mkdir(parents=True, exist_ok=False)
    os.symlink(candidate, stable)
    return candidate


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", help="Extraction directory (default: timestamped Desktop folder with stable symlink)")
    parser.add_argument("--home", default=str(Path.home()), help="Home directory to scan")
    parser.add_argument("--max-media-files", type=int, default=10000, help="Maximum media files to inventory")
    parser.add_argument("--include-sensitive", action="store_true", help="Include WhatsApp key/session stores in addition to message databases")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    home = Path(args.home).expanduser().resolve()
    extract_dir = resolve_output_dir(home, args.output_dir)
    warnings: List[str] = []
    errors: List[str] = []
    database_records: List[Dict] = []

    print(f"Forensic extract directory: {extract_dir}")
    (extract_dir / "databases").mkdir(parents=True, exist_ok=True)
    (extract_dir / "exports").mkdir(parents=True, exist_ok=True)
    (extract_dir / "inventory").mkdir(parents=True, exist_ok=True)

    for spec in database_specs(home, args.include_sensitive):
        source = spec["source"]
        destination = extract_dir / spec["destination"]
        record = {
            "key": spec["key"],
            "source": str(source),
            "destination": str(destination),
            "sensitive": bool(spec.get("sensitive")),
        }
        if not source.exists():
            record["status"] = "missing"
            warnings.append(f"Missing source: {source}")
        else:
            try:
                if spec["kind"] == "sqlite":
                    record.update(snapshot_sqlite(source, destination))
                else:
                    record.update(copy_file(source, destination))
            except Exception as exc:
                record["status"] = "failed"
                record["error"] = str(exc)
                errors.append(f"{spec['key']}: {exc}")
        database_records.append(record)
        print(f"  [{'ok' if record.get('status') == 'copied' else 'skip'}] {spec['key']}: {record.get('status')}")

    exports = export_database_artifacts(extract_dir, database_records, warnings)
    inventory = inventory_media(home, extract_dir, args.max_media_files)
    system_info = write_system_info(extract_dir, home)

    manifest = {
        "generated_at": iso_now(),
        "tool": "priority_extract_final",
        "version": "1.0.0",
        "platform": platform.platform(),
        "home": str(home),
        "output_dir": str(extract_dir),
        "options": {
            "include_sensitive": args.include_sensitive,
            "max_media_files": args.max_media_files,
        },
        "databases": database_records,
        "exports": exports,
        "inventory": inventory,
        "system_info": str(system_info),
        "warnings": warnings,
        "errors": errors,
        "sensitive_data_warning": "Exports may contain private messages, contacts, note titles, and media paths. Store this directory securely and do not commit it.",
    }
    manifest_path = extract_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    copied = sum(1 for record in database_records if record.get("status") == "copied")
    export_rows = sum(item.get("rows", 0) for item in exports)
    print("\nExtraction summary")
    print(f"  Databases/files copied: {copied}/{len(database_records)}")
    print(f"  CSV export rows: {export_rows}")
    print(f"  Media files inventoried: {inventory['files']}{' (truncated)' if inventory['truncated'] else ''}")
    print(f"  Manifest: {manifest_path}")
    if warnings:
        print(f"  Warnings: {len(warnings)}")
    if errors:
        print(f"  Errors: {len(errors)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
