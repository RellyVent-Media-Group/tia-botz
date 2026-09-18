import * as React from "react";
import { Label as LabelPrimitive } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      className={cn(
        "text-xs font-medium tracking-label text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
