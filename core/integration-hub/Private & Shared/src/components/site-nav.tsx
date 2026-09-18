import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/logo-mark";
import { Button } from "@/components/ui/button";
import { siteLinks } from "@/lib/site-navigation";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-[background-color,box-shadow,backdrop-filter] duration-250 ease-out",
        scrolled || open
          ? "bg-background/90 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[4.5rem] sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 text-foreground">
          <LogoMark className="size-7" />
          <span className="font-display text-lg tracking-tight">Gilded Mirrors</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {siteLinks.map((link) => {
            const isHashLink = link.href.startsWith("#");
            const isHomeHashLink = link.href.startsWith("/home#");
            const href = isHomeHashLink ? link.href.replace("/home", "") : link.href;

            return isHashLink || isHomeHashLink ? (
              <a
                key={link.href}
                href={href}
                className="text-sm tracking-wide text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href as "/" | "/integrated-dashboard" | "/character-database" | "/content-calendar" | "/social-templates" | "/tzu-hierarchy" | "/calendar" | "/muppet-lab" | "/gobblers-knob" | "/pricing" | "/voip-dashboard"}
                className="text-sm tracking-wide text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button asChild size="sm" className="hidden md:inline-flex">
          <a href="#contact">Book a plate</a>
        </Button>

        <button
          type="button"
          className="relative size-11 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close" : "Menu"}</span>
          <Menu
            className={cn(
              "absolute inset-0 m-auto size-5 transition-[opacity,transform,filter] duration-200",
              open ? "scale-75 opacity-0 blur-sm" : "scale-100 opacity-100 blur-none",
            )}
          />
          <X
            className={cn(
              "absolute inset-0 m-auto size-5 transition-[opacity,transform,filter] duration-200",
              open ? "scale-100 opacity-100 blur-none" : "scale-75 opacity-0 blur-sm",
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-border bg-background transition-[max-height,opacity] duration-250 ease-out",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile">
          {siteLinks.map((link) => {
            const isHashLink = link.href.startsWith("#");
            const isHomeHashLink = link.href.startsWith("/home#");
            const href = isHomeHashLink ? link.href.replace("/home", "") : link.href;

            return isHashLink || isHomeHashLink ? (
              <a
                key={link.href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center font-display text-2xl tracking-tight text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href as "/" | "/integrated-dashboard" | "/character-database" | "/content-calendar" | "/social-templates" | "/tzu-hierarchy" | "/calendar" | "/muppet-lab" | "/gobblers-knob" | "/pricing" | "/voip-dashboard"}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center font-display text-2xl tracking-tight text-foreground"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
