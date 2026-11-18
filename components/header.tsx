"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTerminal, IconVolume, IconVolumeMute, IconFlame } from "@/components/icons";
import { audioService } from "@/lib/audio";
import { formatSecondsToDigital } from "@/lib/utils";

interface HeaderProps {
  targetRole: string;
  currentDay: number;
  totalDays: number;
  streak: number;
  timerSeconds: number;
  timerActive: boolean;
  onReset: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
  onOpenWeeklyReview?: () => void;
  onTriggerTestClap?: () => void;
}

export function Header({
  targetRole,
  currentDay,
  totalDays,
  streak,
  timerSeconds,
  timerActive,
  onReset,
  userEmail,
  onSignOut,
  onOpenWeeklyReview,
  onTriggerTestClap,
}: HeaderProps) {
  const [muted, setMuted] = React.useState(false);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioService.isMuted = next;
  };

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 lg:px-8 py-3">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="font-mono font-bold text-sm tracking-wider uppercase text-foreground flex items-center gap-2">
            <IconTerminal className="text-foreground" />
            <span>PATHPILOT</span>
          </div>
          <Badge variant="outline">CAREER COACH</Badge>
          {targetRole && (
            <span className="text-xs text-muted-foreground hidden sm:inline font-mono">
              / {targetRole}
            </span>
          )}
        </div>

        {/* Metrics & Timer */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {targetRole && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle border border-border rounded-[2px]">
                <span className="text-muted-foreground uppercase text-[10px]">Day</span>
                <span className="font-semibold text-foreground">
                  {currentDay}/{totalDays}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle border border-border rounded-[2px]">
                <IconFlame className="text-warning" />
                <span className="text-muted-foreground uppercase text-[10px]">Streak</span>
                <span className="font-semibold text-foreground">{streak}d</span>
              </div>

              <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-[2px] ${
                timerActive ? "bg-foreground/5 border-foreground/30 text-foreground" : "bg-surface-subtle border-border text-muted-foreground"
              }`}>
                <span className="text-[10px] uppercase text-muted-foreground">Timer</span>
                <span className="font-bold">{formatSecondsToDigital(timerSeconds)}</span>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTriggerTestClap}
              title="Test Web Audio API Applause Synthesizer"
            >
              Test Clap
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              title={muted ? "Unmute Audio" : "Mute Audio"}
            >
              {muted ? <IconVolumeMute /> : <IconVolume />}
            </Button>

            {targetRole && (
              <Button variant="outline" size="sm" onClick={onReset}>
                Reset
              </Button>
            )}

            {userEmail && (
              <>
                <span
                  className="hidden lg:inline text-[11px] text-muted-foreground max-w-[180px] truncate"
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <Button variant="outline" size="sm" onClick={onSignOut}>
                  Sign out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

