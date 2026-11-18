"use client";

import * as React from "react";
import { IconTerminal } from "@/components/icons";

export interface SystemEvent {
  id: string;
  tag: string;
  timestamp: string;
  details?: string;
}

interface EventDrawerProps {
  events: SystemEvent[];
  onClear?: () => void;
}

export function EventDrawer({ events, onClear }: EventDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <aside aria-label="System Event Bus" className="fixed bottom-0 right-4 w-96 max-w-[calc(100vw-2rem)] z-40 bg-surface border border-border border-b-0 rounded-t-[4px] shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono bg-surface-subtle border-b border-border text-foreground hover:bg-surface-elevated transition-colors text-left"
      >
        <span className="flex items-center gap-2 font-semibold">
          <IconTerminal />
          SYSTEM EVENT BUS
          {events.length > 0 && (
            <span className="px-1.5 py-0.2 bg-foreground text-background font-bold text-[10px] rounded-[2px]">
              {events.length}
            </span>
          )}
        </span>
        <span className="text-muted-foreground text-[10px]">
          {isOpen ? "COLLAPSE" : "EXPAND"}
        </span>
      </button>

      {isOpen && (
        <div className="p-3 bg-background font-mono text-[11px] max-h-56 overflow-y-auto space-y-2">
          {events.length === 0 ? (
            <div className="text-muted-foreground italic py-2">
              No events dispatched yet.
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="border-b border-border/40 pb-1.5 last:border-b-0">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{ev.timestamp}</span>
                </div>
                <div className="text-warning font-semibold mt-0.5 whitespace-pre-wrap break-all">
                  {ev.tag}
                </div>
                {ev.details && (
                  <div className="text-muted-foreground text-[10px] mt-0.5">
                    {ev.details}
                  </div>
                )}
              </div>
            ))
          )}

          {events.length > 0 && onClear && (
            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={onClear}
                className="text-[10px] text-muted-foreground hover:text-foreground uppercase underline"
              >
                Clear Log
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

