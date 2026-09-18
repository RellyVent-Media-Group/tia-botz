import { Section, SectionEyebrow } from "@/components/section";

export function About() {
  return (
    <Section
      id="about"
      innerClassName="grid gap-12 lg:grid-cols-12 lg:gap-16"
    >
        <div className="lg:col-span-4">
          <SectionEyebrow>Studio</SectionEyebrow>
          <h2 className="font-display text-section mt-3 font-medium">
            RellyVent Media Group
          </h2>
        </div>
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground lg:col-span-8 lg:text-lg">
          <p className="text-foreground">
            Gilded Mirrors Originals is a construction catalog — a complete pipeline
            for visual assets across every agent, entity, and soul in the universe.
          </p>
          <p>
            Five core shot types carry the brand: the classic hook face for first
            impression; over-dramatic, epic, and funny plates for personality at
            full volume; trust-building warmth for empathy; and the branding hero
            that makes a character a symbol.
          </p>
          <p>
            This site is the public folio. Each plate is photoreal, editorial, and
            built to travel — social, press, merch, and key art — without losing
            the canon.
          </p>
          <blockquote className="border-l border-primary/50 pl-5 font-display text-xl leading-snug text-foreground italic sm:text-2xl">
            “Use the same character base. Change only the action, the emotion, and
            the light.”
          </blockquote>
        </div>
    </Section>
  );
}
