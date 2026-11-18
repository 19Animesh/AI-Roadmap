import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  showLabel?: boolean;
}

export function Progress({ value, showLabel = false, className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full flex items-center gap-3", className)} {...props}>
      <div className="flex-1 h-2 bg-surface-subtle border border-border rounded-[2px] overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-semibold text-muted-foreground w-10 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}

