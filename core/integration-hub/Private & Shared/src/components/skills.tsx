import { skills } from "@/lib/catalog";
import { Section, SectionEyebrow } from "@/components/section";

export function Skills() {
  return (
    <Section id="craft">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow>Craft</SectionEyebrow>
          <h2 className="font-display text-section mt-3 font-medium">
            How a universe is plated
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Seven studio disciplines, practiced in the same order every time — from
            canon lock to delivery package.
          </p>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {skills.map((skill) => (
            <li key={skill.index} className="bg-background p-7 sm:p-8">
              <span className="text-xs tracking-label text-primary tabular-nums">
                {skill.index}
              </span>
              <h3 className="font-display mt-4 text-2xl font-medium tracking-tight">
                {skill.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {skill.copy}
              </p>
            </li>
          ))}
        </ol>
    </Section>
  );
}
