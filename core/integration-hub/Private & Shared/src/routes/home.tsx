import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { About } from "@/components/about";
import { Skills } from "@/components/skills";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/home")({ component: Home });

function Home() {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="grain" aria-hidden="true" />
      <a
        href="#catalog"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to catalog
      </a>
      <SiteNav />
      <main>
        <Hero />
        <CatalogGrid />
        <About />
        <Skills />
        <ContactForm />
      </main>
      <SiteFooter />
    </div>
  );
}
