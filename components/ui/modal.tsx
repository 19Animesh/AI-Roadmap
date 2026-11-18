import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      <div
        className={cn(
          "w-full max-w-lg bg-surface border border-border rounded-[4px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase font-mono">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-[2px]"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Alert({
  variant = "warning",
  children,
  className,
}: {
  variant?: "warning" | "danger" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    warning: "bg-warning-subtle border-warning/40 text-foreground",
    danger: "bg-danger-subtle border-danger/40 text-foreground",
    success: "bg-success-subtle border-success/40 text-foreground",
    info: "bg-surface-elevated border-border text-foreground",
  };

  return (
    <div
      className={cn(
        "p-4 border rounded-[4px] text-xs leading-relaxed",
        styles[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

