"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  completionRate: number;
  currentStreak: number;
  penaltiesAdded: number;
  improvementTip: string;
}

export function WeeklyReviewModal({
  isOpen,
  onClose,
  weekNumber,
  completionRate,
  currentStreak,
  penaltiesAdded,
  improvementTip,
}: WeeklyReviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Week ${weekNumber} Accountability Review`}>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Seven-day progress summary. Consistent honest review prevents drift.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-surface-subtle border border-border rounded-[4px] text-center">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Tasks Done</div>
            <div className="font-mono text-lg font-bold text-foreground">{completionRate}%</div>
          </div>
          <div className="p-3 bg-surface-subtle border border-border rounded-[4px] text-center">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Active Streak</div>
            <div className="font-mono text-lg font-bold text-foreground">{currentStreak}d</div>
          </div>
          <div className="p-3 bg-surface-subtle border border-border rounded-[4px] text-center">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">Penalties</div>
            <div className={`font-mono text-lg font-bold ${penaltiesAdded > 0 ? "text-danger" : "text-success"}`}>
              {penaltiesAdded}d
            </div>
          </div>
        </div>

        <div className="p-3 bg-surface-subtle border border-border rounded-[4px]">
          <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
            Focus Area for Next 7 Days
          </div>
          <div className="text-xs text-foreground leading-relaxed">
            {improvementTip || "Maintain uninterrupted 45-minute focus intervals. Complete the hardest task first before opening communication channels."}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} variant="primary">
            Start Next 7-Day Cycle
          </Button>
        </div>
      </div>
    </Modal>
  );
}

