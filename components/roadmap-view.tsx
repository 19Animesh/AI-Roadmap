"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconLayers } from "@/components/icons";
import type { PhaseSampleTask } from "@/lib/curricula";

export interface RoadmapPhase {
  id: string;
  name: string;
  days: number;
  milestones: string[];
  deliverable: string;
  sampleDailyTasks?: PhaseSampleTask[];
}

export interface RoadmapData {
  title: string;
  description: string;
  totalDays: number;
  penaltyDays: number;
  phases: RoadmapPhase[];
  isConfirmed: boolean;
}

interface RoadmapViewProps {
  roadmap: RoadmapData;
  onConfirm: () => void;
  onUpdatePhaseDays: (phaseIndex: number, newDays: number) => void;
}

export function RoadmapView({
  roadmap,
  onConfirm,
  onUpdatePhaseDays,
}: RoadmapViewProps) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const calculatedTotalDays = roadmap.phases.reduce((sum, p) => sum + p.days, 0) + (roadmap.penaltyDays || 0);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 bg-surface border border-border rounded-[4px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default">PERSONALIZED ROADMAP</Badge>
              {roadmap.penaltyDays > 0 && (
                <Badge variant="danger">
                  +{roadmap.penaltyDays} {roadmap.penaltyDays === 1 ? "day penalty" : "days penalties"}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {roadmap.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              {roadmap.description}
            </p>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-[11px] font-mono uppercase text-muted-foreground">
                Total Commitment
              </div>
              <div className="font-mono text-2xl font-bold text-foreground">
                {calculatedTotalDays} Days
              </div>
            </div>

            {!roadmap.isConfirmed && (
              <Button onClick={onConfirm} variant="primary" size="lg">
                <IconCheck /> Confirm & Start Day 1
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation prompt notice if not confirmed yet */}
      {!roadmap.isConfirmed && (
        <div className="p-4 bg-surface-subtle border border-border rounded-[4px] flex items-center justify-between text-xs">
          <div className="text-foreground">
            Please review the phases and milestones below. You can adjust the day distribution for each phase before confirming.
          </div>
          <Button onClick={onConfirm} size="sm" variant="default">
            Confirm Roadmap
          </Button>
        </div>
      )}

      {/* Phases List */}
      <div className="space-y-4">
        {roadmap.phases.map((phase, idx) => (
          <Card key={phase.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center font-mono text-xs font-bold bg-surface-subtle border border-border rounded-[2px]">
                  {idx + 1}
                </span>
                <div>
                  <CardTitle>{phase.name}</CardTitle>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {editingIndex === idx ? (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <input
                      type="number"
                      min="3"
                      max="120"
                      value={phase.days}
                      onChange={(e) => onUpdatePhaseDays(idx, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 bg-surface-subtle border border-border rounded-[2px] text-xs font-mono"
                    />
                    <Button size="sm" variant="secondary" onClick={() => setEditingIndex(null)}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {phase.days} Days
                    </Badge>
                    {!roadmap.isConfirmed && (
                      <button
                        onClick={() => setEditingIndex(idx)}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline font-mono"
                      >
                        Adjust
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Deliverable statement */}
            <div className="mb-4 p-3 bg-surface-subtle border border-border/60 rounded-[2px]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Capability Outcome at End of Phase
              </div>
              <div className="text-xs font-medium text-foreground">
                {phase.deliverable}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="text-[11px] font-mono uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <IconLayers /> Core Milestones
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {phase.milestones.map((milestone, mIdx) => (
                  <li
                    key={mIdx}
                    className="p-2 bg-surface-subtle/50 border border-border/40 rounded-[2px] flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="text-foreground mt-0.5">•</span>
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

