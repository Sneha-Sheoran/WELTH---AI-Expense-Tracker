"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({ className, value = 0, extraStyles, ...props }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full transition-all", extraStyles)}
        style={{
          width: `${safeValue}%`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };