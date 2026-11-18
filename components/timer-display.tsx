"use client";

import * as React from "react";
import { formatSecondsToDigital } from "@/lib/utils";
import { IconClock } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

interface TimerDisplayProps {
  remainingSeconds: number;
  isActive: boolean;
  timerEndsAt: string | null;
  onTimerExpire?: () => void;
}

export function TimerDisplay({
  remainingSeconds,
  isActive,
  timerEndsAt,
  onTimerExpire,
}: TimerDisplayProps) {
  const [seconds, setSeconds] = React.useState(remainingSeconds);

  React.useEffect(() => {
    setSeconds(remainingSeconds);
  }, [remainingSeconds]);

  React.useEffect(() => {
    if (!isActive || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimerExpire) onTimerExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, seconds, onTimerExpire]);

  const isExpired = isActive && seconds === 0;

  return (
    <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[4px]">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-[2px] border ${isActive ? "bg-accent/10 border-accent/40 text-accent" : "bg-surface-subtle border-border text-muted-foreground"}`}>
          <IconClock />
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            24-Hour Accountability Window
          </div>
          <div className="text-xs text-foreground mt-0.5">
            {isActive
              ? `Ends at: ${timerEndsAt ? new Date(timerEndsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "in 24h"}`
              : "Starts when you confirm all daily tasks are understood."}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isActive ? (
          <Badge variant={isExpired ? "danger" : "default"}>
            {isExpired ? "WINDOW CLOSED" : "COUNTDOWN ACTIVE"}
          </Badge>
        ) : (
          <Badge variant="secondary">STANDBY</Badge>
        )}

        <div className={`font-mono text-xl font-bold tracking-wider ${isExpired ? "text-danger" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
          {formatSecondsToDigital(seconds)}
        </div>
      </div>
    </div>
  );
}

