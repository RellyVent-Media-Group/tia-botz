import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/catalog";
import { getPostsByCharacter } from "@/lib/content-calendar";

const shotLabel: Record<Project["shot"], string> = {
  hook: "Hook face",
  warmth: "Warmth",
  hero: "Hero",
};

const kindLabel: Record<Project["kind"], string> = {
  agent: "Agent",
  entity: "Entity",
  soul: "Soul",
};

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={cn(
        "group relative isolate overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow] duration-200 ease-out hover:shadow-[var(--shadow-border-hover)]",
        featured ? "min-h-112 sm:min-h-128" : "min-h-96",
      )}
    >
      <button
        type="button"
        className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-expanded={open}
        aria-label={`${project.name}. ${project.archetype}. ${open ? "Hide" : "Show"} description`}
        onClick={() => setOpen((v) => !v)}
      />
      {open ? (
        <p className="sr-only" aria-live="polite">
          {project.hook}. {project.description}
        </p>
      ) : null}
      <img
        src={project.image}
        alt=""
        className={cn(
          "plate absolute inset-0 size-full object-cover object-top transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]",
          featured && "object-center",
        )}
        loading={featured ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6",
          "transition-opacity duration-250 ease-out",
          open
            ? "opacity-0"
            : "opacity-100 group-hover:opacity-0 group-has-[:focus-visible]:opacity-0",
        )}
      >
        <p className="text-xs font-medium tracking-label text-primary uppercase">
          {kindLabel[project.kind]} · {shotLabel[project.shot]}
        </p>
        <h3 className="font-display mt-1.5 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          {project.name}
        </h3>
        <p className="mt-1 text-sm text-foreground/80">{project.archetype}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex flex-col justify-end bg-background/80 p-5 backdrop-blur-sm sm:p-6",
          "transition-[opacity,transform] duration-250 ease-out",
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0 motion-safe:group-has-[:focus-visible]:translate-y-0",
        )}
        aria-hidden="true"
      >
        <p className="text-xs font-medium tracking-label text-primary uppercase">
          {project.realm}
        </p>
        <p className="font-display mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
          {project.name}
        </p>
        <p className="font-display mt-3 text-lg leading-snug text-primary italic">
          “{project.hook}”
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        {(() => {
          const posts = getPostsByCharacter(project.id);
          return posts.length > 0 && (
            <Link
              to="/content-calendar"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition"
            >
              View {posts.length} content post{posts.length > 1 ? "s" : ""}
            </Link>
          );
        })()}
      </div>
    </article>
  );
}
