import { LogoMark } from "@/components/logo-mark";
import { siteLinks } from "@/lib/site-navigation";

const columns = [
  {
    title: "Catalog",
    links: [
      { href: siteLinks[0].href, label: "All plates" },
      { href: siteLinks[0].href, label: "Agents" },
      { href: siteLinks[0].href, label: "Entities" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: siteLinks[1].href, label: "About" },
      { href: siteLinks[2].href, label: siteLinks[2].label },
      { href: siteLinks[3].href, label: siteLinks[3].label },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-6">
          <a href="#top" className="inline-flex items-center gap-2.5 text-foreground">
            <LogoMark className="size-7" />
            <span className="font-display text-xl tracking-tight">Gilded Mirrors Originals</span>
          </a>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Construction catalog for a living universe. Photoreal plates, locked
            canon, delivered across every channel that needs a face.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="md:col-span-3">
            <p className="text-xs font-medium tracking-label text-muted-foreground uppercase">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/90 transition-colors duration-150 hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs tracking-wide text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>RellyVent Media Group · HEART-Tiapmaatzu OS</p>
          <p>© 2026 Gilded Mirrors Originals. Vol. I.</p>
        </div>
      </div>
    </footer>
  );
}
