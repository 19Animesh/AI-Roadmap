"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconClock, IconBookOpen, IconInfo } from "@/components/icons";
import { formatSecondsToDigital } from "@/lib/utils";

export interface TaskItem {
  id: string;
  title: string;
  minutes: number;
  resource: string;
  hint: string;
  description: string;
  completed: boolean;
}

interface DailyTasksProps {
  currentDay: number;
  totalDays: number;
  tasks: TaskItem[];
  timerActive: boolean;
  dayLocked?: boolean;
  timerSeconds?: number;
  onToggleTask: (taskId: string) => void;
  onStart24hTimer: () => void;
  onOpenCheckin: () => void;
  onAskExplanation: (task: TaskItem) => void;
  explanationState?: { taskTitle: string; explanation: string } | null;
}

export function DailyTasks({
  currentDay,
  totalDays,
  tasks,
  timerActive,
  dayLocked = false,
  timerSeconds = 0,
  onToggleTask,
  onStart24hTimer,
  onOpenCheckin,
  onAskExplanation,
  explanationState,
}: DailyTasksProps) {
  const [understandingAnswered, setUnderstandingAnswered] = React.useState(timerActive);

  // Follow the timer: answered while it runs, asked again once it stops (new day)
  React.useEffect(() => {
    setUnderstandingAnswered(timerActive);
  }, [timerActive]);

  if (dayLocked) {
    return (
      <div className="p-5 bg-surface border border-border rounded-[4px] space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="success">DAY {currentDay} COMPLETE</Badge>
          <span className="text-xs font-mono text-muted-foreground">
            Day {currentDay} of {totalDays}
          </span>
        </div>
        <h2 className="text-base font-bold text-foreground">
          Day {currentDay + 1} unlocks when your 24-hour window ends.
        </h2>
        <div className="font-mono text-3xl font-bold tracking-wider text-foreground">
          {formatSecondsToDigital(timerSeconds)}
        </div>
        <p className="text-xs text-muted-foreground">
          Rest, review, or revisit today&apos;s material. New tasks and a fresh 24-hour timer start automatically.
        </p>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.minutes, 0);

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface border border-border rounded-[4px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default">DAILY ASSIGNMENT</Badge>
            <span className="text-xs font-mono text-muted-foreground">
              Day {currentDay} of {totalDays}
            </span>
          </div>
          <h2 className="text-base font-bold text-foreground">
            {completedCount} of {tasks.length} tasks completed
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Estimated Workload
            </div>
            <div className="font-mono text-xs font-semibold text-foreground">
              {totalMinutes} minutes (~{(totalMinutes / 60).toFixed(1)} hrs)
            </div>
          </div>

          <Button
            onClick={onOpenCheckin}
            variant={allCompleted ? "success" : "default"}
            size="md"
          >
            <IconCheck /> Check In for Day {currentDay}
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task, idx) => (
          <Card
            key={task.id}
            className={`transition-colors ${
              task.completed ? "border-success/40 bg-success-subtle/20" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Custom Checkbox (sharp rectangular styling) */}
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                className={`mt-0.5 w-5 h-5 flex items-center justify-center border rounded-[2px] transition-colors ${
                  task.completed
                    ? "bg-success border-success text-white"
                    : "bg-surface-subtle border-border hover:border-foreground/50 text-transparent"
                }`}
              >
                <IconCheck />
              </button>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <div
                    onClick={() => onToggleTask(task.id)}
                    className={`text-xs font-semibold cursor-pointer ${
                      task.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {idx + 1}. {task.title}
                  </div>
                  <Badge variant="secondary">
                    <IconClock /> {task.minutes} min
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {task.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                  {/* Free Resource Box */}
                  <div className="p-2 bg-surface-subtle border border-border/60 rounded-[2px] flex items-start gap-2">
                    <IconBookOpen className="text-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono uppercase text-[10px] text-muted-foreground block">
                        Free Resource
                      </span>
                      <span className="text-foreground">{task.resource}</span>
                    </div>
                  </div>

                  {/* Hint Box */}
                  <div className="p-2 bg-surface-subtle border border-border/60 rounded-[2px] flex items-start gap-2">
                    <IconInfo className="text-warning shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono uppercase text-[10px] text-muted-foreground block">
                        Practical Hint
                      </span>
                      <span className="text-muted-foreground">{task.hint}</span>
                    </div>
                  </div>
                </div>

                {/* Need clarification button */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => onAskExplanation(task)}
                    className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline"
                  >
                    Ask Coach to simplify this task
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Explanation output if requested */}
      {explanationState && (
        <div className="p-4 bg-surface border border-border rounded-[4px] space-y-2">
          <div className="text-[11px] font-mono uppercase text-muted-foreground">
            PathPilot Explanation: {explanationState.taskTitle}
          </div>
          <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
            {explanationState.explanation}
          </div>
        </div>
      )}

      {/* MANDATORY UNDERSTANDING CHECK & TIMER START */}
      <div className="p-5 bg-surface border border-border rounded-[4px] space-y-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-muted-foreground mb-1">
            Accountability Protocol
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Is there any task you didn&apos;t understand?
          </h3>
        </div>

        {!understandingAnswered ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setUnderstandingAnswered(true);
                onStart24hTimer();
              }}
              variant="primary"
            >
              No, I understand all tasks. Start my 24h timer!
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                if (tasks[0]) onAskExplanation(tasks[0]);
              }}
            >
              Yes, I need clarification on a task
            </Button>
          </div>
        ) : (
          <div className="p-3 bg-surface-subtle border border-border/60 rounded-[2px] flex items-center justify-between text-xs">
            <span className="text-foreground">
              Coach: &quot;Great, your 24-hour timer starts now. Go get it!&quot;
            </span>
            <Badge variant="success">TIMER IN PROGRESS</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

