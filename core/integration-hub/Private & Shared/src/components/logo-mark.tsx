import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-primary", className)}
      fill="none"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="25" height="25" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="15" height="15" rx="0.75" stroke="currentColor" strokeWidth="1" />
      <path d="M16 8.5v-5M16 28.5v-5M8.5 16h-5M28.5 16h-5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
