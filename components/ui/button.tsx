import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium font-sans border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-[4px]";

    const variantStyles = {
      default:
        "bg-primary text-primary-foreground border-primary hover:opacity-90 active:opacity-95 font-semibold",
      primary:
        "bg-primary text-primary-foreground border-primary hover:opacity-90 active:opacity-95 font-semibold",
      secondary:
        "bg-surface text-foreground border-border hover:bg-surface-subtle active:bg-surface-elevated",
      outline:
        "bg-transparent text-foreground border-border hover:bg-surface-subtle hover:border-foreground/40",
      danger:
        "bg-danger-subtle text-danger border-danger hover:bg-danger hover:text-white",
      success:
        "bg-success text-white border-success hover:brightness-105 font-semibold",
      ghost:
        "bg-transparent text-foreground border-transparent hover:bg-surface-subtle",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs tracking-normal gap-2",
      lg: "h-11 px-5 text-sm gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

