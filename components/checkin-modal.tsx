"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TaskItem } from "@/components/daily-tasks";
import { audioService } from "@/lib/audio";
import { classifyExcuse, getNextQuote } from "@/lib/utils";
import { IconCheck, IconAlertTriangle } from "@/components/icons";

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  totalDays: number;
  tasks: TaskItem[];
  currentStreak: number;
  penaltiesThisWeek: number;
  totalExtraDays: number;
  hardExcuseCount: number;
  onSuccessCheckin: (newStreak: number) => void;
  onRescheduleTasks: (simplifiedSubtasks: string[]) => void;
  onAddPenaltyDay: (warningText: string, quote: string, quoteIdx: number) => void;
  onLogEvent: (tag: string, details?: string) => void;
  onRestDayApproved: () => void;
}

export function CheckinModal({
  isOpen,
  onClose,
  dayNumber,
  totalDays,
  tasks,
  currentStreak,
  penaltiesThisWeek,
  totalExtraDays,
  hardExcuseCount,
  onSuccessCheckin,
  onRescheduleTasks,
  onAddPenaltyDay,
  onLogEvent,
  onRestDayApproved,
}: CheckinModalProps) {
  const [viewState, setViewState] = React.useState<
    "review" | "celebration" | "missed_reason" | "rescheduled" | "penalty" | "unclear_followup"
  >("review");

  const [reasonText, setReasonText] = React.useState("");
  const [penaltyResult, setPenaltyResult] = React.useState<{ warning: string; quote: string; quoteIdx: number } | null>(null);
  const [lastQuoteIdx, setLastQuoteIdx] = React.useState(-1);
  const [celebrationStreak, setCelebrationStreak] = React.useState(0);
  const [followupResponse, setFollowupResponse] = React.useState("");

  const completedCount = tasks.filter((t) => t.completed).length;
  const missedTasks = tasks.filter((t) => !t.completed);
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  React.useEffect(() => {
    if (isOpen) {
      setViewState("review");
      setReasonText("");
      setPenaltyResult(null);
    }
  }, [isOpen]);

  // Handle all completed flow
  const handleProceedAllCompleted = () => {
    audioService.playClapAudio();
    onLogEvent("[EVENT: PLAY_CLAP_AUDIO]", "Synthetic Web Audio crowd applause triggered");
    onLogEvent('[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]', "Celebration screen presented");
    setCelebrationStreak(currentStreak + 1);
    setViewState("celebration");
    onSuccessCheckin(currentStreak + 1);
  };

  // Handle reason submission
  const handleSubmitReason = (textToClassify: string) => {
    const text = textToClassify.trim();
    if (!text) return;

    const res = classifyExcuse(text);

    if (res.type === "valid") {
      const subtasks = [
        `Deconstruct "${missedTasks[0]?.title || 'missed task'}" into core syntax essentials`,
        `Build minimal reproduction test case (30 min)`,
        `Complete final implementation and verify tests (30 min)`,
      ];
      onLogEvent("[EVENT: RESCHEDULE_TASKS]", `Reason classified as valid (${res.keyword || 'workload/emergency'})`);
      onRescheduleTasks(subtasks);
      setViewState("rescheduled");
      return;
    }

    if (res.type === "invalid") {
      const q = getNextQuote(lastQuoteIdx);
      setLastQuoteIdx(q.index);
      const warningStr = "⚠️ Warning: At this pace you will not reach your goal on time. You're moving too slow. Push harder!";

      onLogEvent("[EVENT: ADD_DAY]", `1 extra day added to roadmap. Reason: ${text}`);
      onAddPenaltyDay(warningStr, q.quote, q.index);
      setPenaltyResult({
        warning: warningStr,
        quote: q.quote,
        quoteIdx: q.index,
      });
      setViewState("penalty");
      return;
    }

    // Unclear
    setViewState("unclear_followup");
  };

  const handleRestDay = () => {
    onRestDayApproved();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Day ${dayNumber} Check-In`}>
      {/* 1. REVIEW VIEW */}
      {viewState === "review" && (
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Accountability check: confirm completion status for Day {dayNumber}.
          </div>

          <div className="p-3 bg-surface-subtle border border-border rounded-[4px] space-y-2">
            <div className="text-xs font-semibold text-foreground flex justify-between">
              <span>Task Breakdown</span>
              <span className="font-mono">
                {completedCount} / {tasks.length} Completed
              </span>
            </div>
            {tasks.map((t) => (
              <div key={t.id} className="text-xs flex items-center justify-between text-muted-foreground">
                <span className={t.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}>
                  {t.title}
                </span>
                <span className="font-mono text-[11px]">
                  {t.completed ? "DONE" : "MISSED"}
                </span>
              </div>
            ))}
          </div>

          {allCompleted ? (
            <div className="pt-2 flex justify-end">
              <Button onClick={handleProceedAllCompleted} variant="success" size="lg">
                <IconCheck /> Confirm All Tasks Completed
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="text-xs text-warning flex items-center gap-1.5 font-medium">
                <IconAlertTriangle />
                {missedTasks.length} {missedTasks.length === 1 ? "task was" : "tasks were"} not marked completed.
              </div>

              <Button onClick={() => setViewState("missed_reason")} variant="default" className="w-full">
                Proceed to Reason Review
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleRestDay}
                  className="text-xs text-muted-foreground hover:text-foreground underline font-mono"
                >
                  Feeling overwhelmed or sick? Take a scheduled Rest Day (No penalty)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CELEBRATION VIEW (ALL COMPLETED) */}
      {viewState === "celebration" && (
        <div className="text-center py-4 space-y-5">
          <div className="font-mono text-xs uppercase tracking-widest text-success font-bold">
            [EVENT: SHOW_SCREEN]
          </div>
          <h2 className="text-xl font-bold text-success">
            Hurray! One step ahead on your journey!
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Clean execution today. Your discipline separates you from those who only talk about their goals.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 bg-surface-subtle border border-border rounded-[4px]">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Streak</div>
              <div className="font-mono text-xl font-bold text-foreground">+{celebrationStreak} Days</div>
            </div>
            <div className="p-3 bg-surface-subtle border border-border rounded-[4px]">
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Progress</div>
              <div className="font-mono text-xl font-bold text-foreground">
                {Math.min(100, Math.round(((dayNumber) / totalDays) * 100))}%
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Button onClick={onClose} variant="primary" size="lg" className="w-full">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* 3. MISSED REASON FORM */}
      {viewState === "missed_reason" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-foreground mb-1">
              Accountability Check
            </h3>
            <p className="text-xs text-muted-foreground">
              What stopped you from completing &quot;{missedTasks[0]?.title || 'your daily tasks'}&quot;?
            </p>
          </div>

          {/* Quick reason templates */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Select or type reason
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                "Task was too hard or too big",
                "Unclear instructions on the exercise",
                "Illness or unexpected medical issue",
                "Urgent work deadline or unexpected exam",
                "Procrastination / social media distraction",
                "Lost motivation / forgot",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReasonText(preset)}
                  className={`p-2 text-left border rounded-[2px] text-xs transition-colors ${
                    reasonText === preset
                      ? "bg-surface-elevated border-foreground text-foreground font-semibold"
                      : "bg-surface-subtle border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-muted-foreground block mb-1">
              Explain in your own words
            </label>
            <Textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Be honest. PathPilot will adapt or hold you accountable based on this response."
            />
          </div>

          <div className="pt-2 flex justify-between">
            <Button variant="secondary" onClick={() => setViewState("review")}>
              Back
            </Button>
            <Button
              onClick={() => handleSubmitReason(reasonText)}
              disabled={!reasonText.trim()}
              variant="default"
            >
              Submit Explanation
            </Button>
          </div>
        </div>
      )}

      {/* 4. VALID REASON (RESCHEDULED) */}
      {viewState === "rescheduled" && (
        <div className="space-y-4">
          <div className="p-3 bg-surface-subtle border border-border rounded-[4px]">
            <Badge variant="secondary" className="mb-2">
              REASON CLASSIFIED: VALID
            </Badge>
            <p className="text-xs text-foreground leading-relaxed">
              I understand completely. Real life happens, and challenging concepts take iteration.
              No penalties have been added to your timeline.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase text-muted-foreground mb-2">
              Action Taken: [EVENT: RESCHEDULE_TASKS]
            </div>
            <div className="p-3 bg-surface-subtle border border-border rounded-[4px] space-y-1.5 text-xs">
              <div className="font-semibold text-foreground">
                Simplified task broken into smaller steps for tomorrow:
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Trace and isolate the fundamental syntax in a sandbox</li>
                <li>Write 1 minimal working test case</li>
                <li>Integrate solution step-by-step</li>
              </ul>
            </div>
          </div>

          {hardExcuseCount >= 2 && (
            <div className="p-3 bg-warning-subtle border border-warning/30 rounded-[4px] text-xs text-foreground">
              Notice: You have encountered difficulty multiple times. If this pattern continues, we will adjust the roadmap pace.
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button onClick={onClose} variant="primary">
              Acknowledge & Update Schedule
            </Button>
          </div>
        </div>
      )}

      {/* 5. INVALID REASON (PENALTY & WARNING) */}
      {viewState === "penalty" && penaltyResult && (
        <div className="space-y-4">
          <Badge variant="danger" className="mb-1">
            REASON CLASSIFIED: INVALID [EVENT: ADD_DAY]
          </Badge>

          {/* Exact required warning text */}
          <div className="p-3 bg-danger-subtle border border-danger/40 rounded-[4px]">
            <p className="text-xs font-bold text-danger leading-relaxed">
              {penaltyResult.warning}
            </p>
          </div>

          {/* Motivational / funny quote directly below */}
          <div className="p-3 bg-surface-subtle border border-border rounded-[4px] italic text-xs text-foreground">
            &quot;{penaltyResult.quote}&quot;
          </div>

          <div className="text-xs text-muted-foreground">
            +1 extra day added to roadmap. (Penalties this week: {penaltiesThisWeek + 1} / 2 allowed).
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={onClose} variant="default">
              Accept & Resume Tomorrow
            </Button>
          </div>
        </div>
      )}

      {/* 6. UNCLEAR REASON FOLLOWUP */}
      {viewState === "unclear_followup" && (
        <div className="space-y-4">
          <Badge variant="secondary">FOLLOW-UP CLARIFICATION</Badge>
          <p className="text-xs text-foreground">
            Was this incomplete due to an unexpected external blocker, or did attention and time get diverted elsewhere?
          </p>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmitReason("Unexpected external blocker: urgent work")}
            >
              External blocker (Work, health, outage, emergency)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmitReason("Distraction: procrastination and social media")}
            >
              Time got diverted (Procrastination, distraction, missed focus)
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

