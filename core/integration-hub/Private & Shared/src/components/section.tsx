import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export function Section({ id, children, className, innerClassName }: SectionProps) {
  return (
    <section id={id} className={cn("border-t border-border", className)}>
      <div
        className={cn(
          "mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-mark text-primary uppercase">
      {children}
    </p>
  );
}
