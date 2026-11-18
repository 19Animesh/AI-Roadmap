import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-elevated text-foreground border-border",
    secondary: "bg-surface-subtle text-muted-foreground border-border",
    outline: "bg-transparent text-foreground border-border",
    success: "bg-success-subtle text-success border-success/30",
    warning: "bg-warning-subtle text-warning border-warning/30",
    danger: "bg-danger-subtle text-danger border-danger/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-medium border rounded-[2px] uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

