import { useMemo, useState } from "react";
import { filterProjects, filters, projects, type FilterId } from "@/lib/catalog";
import { ProjectCard } from "@/components/project-card";
import { Section, SectionEyebrow } from "@/components/section";
import { cn } from "@/lib/utils";

export function CatalogGrid() {
  const [active, setActive] = useState<FilterId>("all");
  const list = useMemo(() => filterProjects(active), [active]);
  const featured = active === "all" ? list.slice(0, 2) : [];
  const rest = active === "all" ? list.slice(2) : list;
  const totalProjects = projects.length;

  return (
    <Section id="catalog">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <SectionEyebrow>Catalog</SectionEyebrow>
            <h2 className="font-display text-section mt-3 font-medium">
              Plates in circulation
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Hover a plate for the short read. On touch, tap to reveal. Filter by
              roster or shot type.
            </p>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {String(list.length).padStart(2, "0")} / {String(totalProjects).padStart(2, "0")}
          </p>
        </div>

        <div
          className="mt-10 flex flex-nowrap gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter catalog"
        >
          {filters.map((chip) => {
            const isOn = active === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={isOn}
                onClick={() => setActive(chip.id)}
                className={cn(
                  "h-11 shrink-0 rounded-full border px-4 text-sm tracking-wide transition-[background-color,color,border-color] duration-150 ease-out",
                  isOn
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {featured.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "grid gap-5",
            featured.length > 0 ? "mt-5" : "mt-10",
            rest.length === 1
              ? "max-w-xl"
              : rest.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} featured={rest.length === 1} />
          ))}
        </div>
    </Section>
  );
}
