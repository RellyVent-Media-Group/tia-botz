import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="top" className="relative min-h-svh overflow-hidden">
      <img
        src="/images/hero-mirror.jpg"
        alt="Ornate gilded mirror in a dark baroque hall"
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/20" />

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
        <p className="mb-5 text-xs font-medium tracking-mark text-primary uppercase">
          Vol. I — Construction Catalog
        </p>
        <h1 className="font-display text-display max-w-5xl pl-4 font-medium text-foreground italic sm:pl-2">
          Gilded
          <span className="block not-italic">Mirrors</span>
        </h1>
        <div className="mt-6 flex max-w-xl flex-col gap-6 sm:mt-8">
          <p className="text-base leading-relaxed text-foreground/85 sm:text-lg">
            Originals. A studio portfolio of agents, entities, and souls — plates
            built for first impression, warmth, and brand.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <a href="#catalog">Enter the catalog</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/content-calendar">Content Calendar</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#contact">Inquire</a>
          </Button>
        </div>
        <a
          href="#catalog"
          className="mt-14 inline-flex items-center gap-2 text-xs tracking-label text-muted-foreground uppercase transition-colors duration-150 hover:text-primary"
        >
          <ArrowDown className="size-3.5" />
          Scroll the plates
        </a>
      </div>
    </section>
  );
}
