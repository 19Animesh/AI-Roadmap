"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { OnboardingWizard, OnboardingData } from "@/components/onboarding-wizard";
import { RoadmapView, RoadmapData } from "@/components/roadmap-view";
import { DailyTasks, TaskItem } from "@/components/daily-tasks";
import { CheckinModal } from "@/components/checkin-modal";
import { WeeklyReviewModal } from "@/components/weekly-review-modal";
import { EventDrawer, SystemEvent } from "@/components/event-drawer";
import { CoachChat, ChatMessage } from "@/components/coach-chat";
import { PREDEFINED_CURRICULA, generateCustomRoadmap } from "@/lib/curricula";
import { audioService } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginGateModal } from "@/components/login-gate-modal";
import { useSession, authPost, signOut } from "@/lib/auth";

const PENDING_ONBOARDING_KEY = "pathpilot_pending_onboarding";

export default function PathPilotApp() {
  // Auth (Google via Supabase). There is no guest mode.
  const { session, ready: authReady } = useSession();
  // Wizard answers waiting for the user to finish signing in
  const [pendingOnboarding, setPendingOnboarding] = React.useState<OnboardingData | null>(null);

  // Application State
  const [isOnboarded, setIsOnboarded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"tasks" | "roadmap" | "chat">("tasks");

  // Profile / Onboarding State
  const [profile, setProfile] = React.useState<OnboardingData | null>(null);

  // Roadmap State
  const [roadmap, setRoadmap] = React.useState<RoadmapData | null>(null);

  // Daily Tasks State
  const [currentDay, setCurrentDay] = React.useState(1);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [penaltiesThisWeek, setPenaltiesThisWeek] = React.useState(0);
  const [totalExtraDays, setTotalExtraDays] = React.useState(0);
  const [hardExcuseCount, setHardExcuseCount] = React.useState(0);

  // 24-Hour Timer State (stored with end timestamp)
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(86400);
  const [timerEndsAt, setTimerEndsAt] = React.useState<string | null>(null);
  // True when today's tasks are done but the 24h window is still running.
  // The next day unlocks only when that window ends (no timer restart).
  const [dayLocked, setDayLocked] = React.useState(false);

  // Modals & Panels
  const [isCheckinOpen, setIsCheckinOpen] = React.useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = React.useState(false);
  const [systemEvents, setSystemEvents] = React.useState<SystemEvent[]>([]);
  const [explanationState, setExplanationState] = React.useState<{ taskTitle: string; explanation: string } | null>(null);

  // Coach Dialogue State
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content: "I am PathPilot. I will build your personalized career roadmap, assign daily tasks, and enforce disciplined consistency. Let us get to work.",
      timestamp: "00:00",
    },
  ]);
  const [isCoachThinking, setIsCoachThinking] = React.useState(false);

  // Load from localStorage on client mount
  React.useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("pathpilot_profile");
      const savedRoadmap = localStorage.getItem("pathpilot_roadmap");
      const savedDay = localStorage.getItem("pathpilot_current_day");
      const savedTasks = localStorage.getItem("pathpilot_daily_tasks");
      const savedStreak = localStorage.getItem("pathpilot_streak");
      const savedPenalties = localStorage.getItem("pathpilot_penalties");
      const savedExtra = localStorage.getItem("pathpilot_extra_days");
      const savedTimerEnds = localStorage.getItem("pathpilot_timer_ends_at");
      const savedDayLocked = localStorage.getItem("pathpilot_day_locked");
      const savedPending = localStorage.getItem(PENDING_ONBOARDING_KEY);
      if (savedPending) setPendingOnboarding(JSON.parse(savedPending));

      if (savedProfile && savedRoadmap) {
        setProfile(JSON.parse(savedProfile));
        setRoadmap(JSON.parse(savedRoadmap));
        setIsOnboarded(true);

        if (savedDay) setCurrentDay(parseInt(savedDay, 10));
        if (savedStreak) setStreak(parseInt(savedStreak, 10));
        if (savedPenalties) setPenaltiesThisWeek(parseInt(savedPenalties, 10));
        if (savedExtra) setTotalExtraDays(parseInt(savedExtra, 10));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedDayLocked === "true") setDayLocked(true);

        // Restore database/persistent timer
        if (savedTimerEnds) {
          const endsTime = new Date(savedTimerEnds).getTime();
          const now = Date.now();
          const diff = Math.floor((endsTime - now) / 1000);
          if (diff > 0) {
            setTimerActive(true);
            setTimerSeconds(diff);
            setTimerEndsAt(savedTimerEnds);
          } else {
            setTimerActive(false);
            setTimerSeconds(0);
            setTimerEndsAt(savedTimerEnds);
          }
        }
      }
    } catch (e) {
      console.warn("Storage sync notice:", e);
    }
  }, []);

  // Save to localStorage whenever core state updates
  React.useEffect(() => {
    if (!isOnboarded) return;
    try {
      if (profile) localStorage.setItem("pathpilot_profile", JSON.stringify(profile));
      if (roadmap) localStorage.setItem("pathpilot_roadmap", JSON.stringify(roadmap));
      localStorage.setItem("pathpilot_current_day", String(currentDay));
      localStorage.setItem("pathpilot_daily_tasks", JSON.stringify(tasks));
      localStorage.setItem("pathpilot_streak", String(streak));
      localStorage.setItem("pathpilot_penalties", String(penaltiesThisWeek));
      localStorage.setItem("pathpilot_extra_days", String(totalExtraDays));
      if (timerEndsAt) localStorage.setItem("pathpilot_timer_ends_at", timerEndsAt);
      else localStorage.removeItem("pathpilot_timer_ends_at");
      localStorage.setItem("pathpilot_day_locked", String(dayLocked));
    } catch (e) {
      console.warn("Storage save notice:", e);
    }
  }, [isOnboarded, profile, roadmap, currentDay, tasks, streak, penaltiesThisWeek, totalExtraDays, timerEndsAt, dayLocked]);

  // Refs so the timer interval always sees the latest state/handlers
  const dayLockedRef = React.useRef(dayLocked);
  dayLockedRef.current = dayLocked;
  const unlockNextDayRef = React.useRef<() => void>(() => {});

  // Live countdown derived from the stored end timestamp. When the window
  // ends while the next day is locked, the next day unlocks automatically.
  React.useEffect(() => {
    if (!timerEndsAt) return;
    const endsTime = new Date(timerEndsAt).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endsTime - Date.now()) / 1000));
      setTimerSeconds(remaining);
      if (remaining > 0) return false;
      setTimerActive(false);
      if (dayLockedRef.current) unlockNextDayRef.current();
      return true;
    };

    if (tick()) return;
    const id = setInterval(() => {
      if (tick()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [timerEndsAt]);

  const isTimerRunning = () =>
    !!timerEndsAt && new Date(timerEndsAt).getTime() > Date.now();

  // Fully stop the timer (used when a day is rescheduled, penalized, or rested)
  // and turn off the server-side reminder emails for it.
  const stopTimer = (reason = "stopped") => {
    setTimerActive(false);
    setTimerEndsAt(null);
    setTimerSeconds(86400);
    authPost("/api/timer/stop", { reason }).catch(() => {});
  };

  // Save onboarding answers / progress to the signed-in user's profile
  const syncProfile = (fields: Record<string, unknown>) => {
    authPost("/api/profile/sync", fields).catch(() => {});
  };

  // Log system event tags helper
  const logEvent = (tag: string, details?: string) => {
    const newEvent: SystemEvent = {
      id: "ev-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      tag,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      details,
    };
    setSystemEvents((prev) => [newEvent, ...prev]);
  };

  // Wizard finished: require sign-in before generating the roadmap.
  // The answers are stored locally so they survive the Google redirect.
  const handleWizardSubmit = (data: OnboardingData) => {
    if (session) {
      handleOnboardingComplete(data);
      return;
    }
    try {
      localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(data));
    } catch {}
    setPendingOnboarding(data);
  };

  // Back from Google with pending answers: finish setup automatically
  React.useEffect(() => {
    if (!authReady || !session || !pendingOnboarding) return;
    handleOnboardingComplete(pendingOnboarding);
    setPendingOnboarding(null);
    try {
      localStorage.removeItem(PENDING_ONBOARDING_KEY);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, session, pendingOnboarding]);

  // Existing local roadmap + newly signed-in user: push progress (and any
  // running timer) to the server so reminder emails work.
  const syncedUserRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!authReady || !session || !isOnboarded || !profile) return;
    if (syncedUserRef.current === session.user.id) return;
    syncedUserRef.current = session.user.id;

    syncProfile({ ...profile, currentDay, streak });
    if (!dayLocked && timerEndsAt && new Date(timerEndsAt).getTime() > Date.now()) {
      authPost("/api/timer/start", {
        currentDay,
        targetRole: profile.targetRole,
        endsAt: timerEndsAt,
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, session, isOnboarded, profile]);

  // Onboarding Completion
  const handleOnboardingComplete = (data: OnboardingData) => {
    setProfile(data);
    syncProfile({ ...data, currentDay: 1, streak: 0 });
    syncedUserRef.current = session?.user.id ?? null;

    // Look up or synthesize curriculum
    const slug = data.targetRole.toLowerCase().replace(/\s+/g, "-");
    const predefined = PREDEFINED_CURRICULA[slug];

    let generated: RoadmapData;
    if (predefined) {
      generated = {
        title: predefined.roleName,
        description: predefined.description,
        totalDays: data.targetDays,
        penaltyDays: 0,
        phases: predefined.phases,
        isConfirmed: false,
      };
    } else {
      const custom = generateCustomRoadmap(
        data.targetRole,
        data.background,
        data.skillLevel,
        data.hoursPerDay,
        data.targetDays,
        data.learningStyle
      );
      generated = {
        title: custom.roleName,
        description: custom.description,
        totalDays: custom.defaultTimelineDays,
        penaltyDays: 0,
        phases: custom.phases,
        isConfirmed: false,
      };
    }

    setRoadmap(generated);
    setIsOnboarded(true);
    setActiveTab("roadmap");

    // Initialize Day 1 tasks from Phase 1
    const phase1 = generated.phases[0];
    const initialTasks: TaskItem[] = (phase1?.sampleDailyTasks || []).map((t, idx) => ({
      id: "task-1-" + (idx + 1),
      title: t.title,
      minutes: t.minutes,
      resource: t.resource,
      hint: t.hint,
      description: t.description,
      completed: false,
    }));
    setTasks(initialTasks);

    logEvent("[EVENT: ONBOARDING_COMPLETED]", `Roadmap generated for ${data.targetRole} (${data.targetDays} days)`);
  };

  // Confirm Roadmap & Start Day 1
  const handleConfirmRoadmap = () => {
    if (!roadmap) return;
    setRoadmap({ ...roadmap, isConfirmed: true });
    setActiveTab("tasks");
    logEvent("[EVENT: ROADMAP_CONFIRMED]", "Phase distribution locked. Ready for Day 1.");
  };

  // Update Days for a Phase
  const handleUpdatePhaseDays = (phaseIdx: number, newDays: number) => {
    if (!roadmap) return;
    const updatedPhases = [...roadmap.phases];
    if (updatedPhases[phaseIdx]) {
      updatedPhases[phaseIdx].days = Math.max(1, newDays);
    }
    const newTotal = updatedPhases.reduce((sum, p) => sum + p.days, 0);
    setRoadmap({
      ...roadmap,
      phases: updatedPhases,
      totalDays: newTotal,
    });
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    audioService.playTone(600, "sine", 0.04);
  };

  // Start 24-Hour Timer (Stores end timestamp in database / backend)
  const handleStart24hTimer = async () => {
    // Never restart a window that is still running.
    if (dayLocked || isTimerRunning()) return;
    const now = Date.now();
    const endsAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();

    setTimerActive(true);
    setTimerSeconds(86400);
    setTimerEndsAt(endsAt);

    logEvent("[EVENT: START_TIMER_24H]", `Timer expiration set to ${new Date(endsAt).toLocaleTimeString()}`);
    audioService.playTone(880, "sine", 0.25);

    // Store timer_ends_at on the server so the reminder emails go out
    try {
      await authPost("/api/timer/start", {
        currentDay,
        targetRole: profile?.targetRole,
        endsAt,
      });
    } catch (e) {
      console.warn("Backend timer sync:", e);
    }
  };

  // Ask Coach for Task Clarification
  const handleAskExplanation = async (task: TaskItem) => {
    setIsCoachThinking(true);
    const userPrompt = `I didn't understand the task: "${task.title}". Can you explain it in simpler words with a concrete example?`;

    // Add to chat thread
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userPrompt },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.reply || `Here is a simpler breakdown of "${task.title}": Think of it like taking a complex blueprint and assembling one brick at a time. For example, before styling 10 cards, build 1 card, test it, and duplicate. Resource: ${task.resource}. Hint: ${task.hint}.`;

      setExplanationState({
        taskTitle: task.title,
        explanation: reply,
      });

      const assistantMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setExplanationState({
        taskTitle: task.title,
        explanation: `Simplified explanation: Focus on the core goal of "${task.title}". Begin with the simplest possible test case, verify it works, then add edge cases. Resource: ${task.resource}.`,
      });
    } finally {
      setIsCoachThinking(false);
    }
  };

  // Send Direct Message in Coach Chat
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsCoachThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Message received. Keep your daily commitments sharp.";

      // Check for event tags emitted by Claude
      if (Array.isArray(data.events)) {
        data.events.forEach((ev: string) => logEvent(ev, "Detected in Coach response"));
        if (data.events.includes("[EVENT: PLAY_CLAP_AUDIO]")) {
          audioService.playClapAudio();
        }
        if (data.events.includes("[EVENT: START_TIMER_24H]")) {
          handleStart24hTimer();
        }
      }

      const assistantMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const fallbackMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: "I received your note. Focus on completing your daily tasks before the timer ends. Let me know if you need any task broken down.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsCoachThinking(false);
    }
  };

  // Success Check-in (All completed)
  const handleSuccessCheckin = (newStreak: number) => {
    setStreak(newStreak);
    syncProfile({ streak: newStreak });

    if (isTimerRunning()) {
      // Finished early: keep the current 24h window running and lock the next
      // day until it ends, instead of restarting the timer. The day is done,
      // so the server-side reminder emails are turned off.
      setDayLocked(true);
      authPost("/api/timer/stop", { reason: "day_completed" }).catch(() => {});
      logEvent(
        "[EVENT: DAY_LOCKED]",
        `Day ${currentDay + 1} unlocks at ${new Date(timerEndsAt as string).toLocaleTimeString()}`
      );
      return;
    }

    unlockNextDay();
  };

  // Move to the next day: fresh tasks, timer back on standby until the user
  // confirms they understand the new tasks.
  const unlockNextDay = () => {
    const nextDay = currentDay + 1;
    setDayLocked(false);
    setCurrentDay(nextDay);
    stopTimer("next_day");
    syncProfile({ currentDay: nextDay });
    setExplanationState(null);

    // Generate tasks for the next day
    const phaseIndex = Math.min(
      Math.floor((nextDay - 1) / Math.max(1, Math.floor((roadmap?.totalDays || 60) / 4))),
      (roadmap?.phases.length || 1) - 1
    );
    const activePhase = roadmap?.phases[phaseIndex];

    const nextTasks: TaskItem[] = (activePhase?.sampleDailyTasks || []).map((t, idx) => ({
      id: `task-${nextDay}-${idx + 1}`,
      title: `${t.title} (Part ${idx + 1})`,
      minutes: t.minutes,
      resource: t.resource,
      hint: t.hint,
      description: t.description,
      completed: false,
    }));
    setTasks(nextTasks);

    // Every 7 days trigger weekly review
    if (nextDay % 7 === 1 && nextDay > 1) {
      setTimeout(() => setIsWeeklyReviewOpen(true), 1200);
    }
  };
  unlockNextDayRef.current = () => {
    logEvent("[EVENT: DAY_UNLOCKED]", `24-hour window ended. Day ${currentDay + 1} unlocked.`);
    unlockNextDay();
  };

  // Reschedule on Valid Excuse
  const handleRescheduleTasks = (simplifiedSubtasks: string[]) => {
    setHardExcuseCount((prev) => prev + 1);
    stopTimer("rescheduled");

    const rescheduledTasks: TaskItem[] = simplifiedSubtasks.map((title, idx) => ({
      id: `rescheduled-${Date.now()}-${idx}`,
      title,
      minutes: 40,
      resource: tasks[0]?.resource || "Official Documentation",
      hint: "Deconstruct into minimal working proof before scaling up.",
      description: "Simplified subtask generated by PathPilot to build progressive mastery.",
      completed: false,
    }));

    setTasks(rescheduledTasks);
  };

  // Add Penalty Day on Invalid Excuse
  const handleAddPenaltyDay = (warningText: string, quote: string) => {
    if (penaltiesThisWeek < 2) {
      setPenaltiesThisWeek((prev) => prev + 1);
      setTotalExtraDays((prev) => prev + 1);
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          penaltyDays: (roadmap.penaltyDays || 0) + 1,
        });
      }
    }
    stopTimer("penalty");
  };

  // Reset Application Data
  const handleReset = () => {
    if (confirm("Reset roadmap, tasks, and accountability streak?")) {
      // Remove only app data; keep the Supabase sign-in session
      Object.keys(localStorage)
        .filter((k) => k.startsWith("pathpilot_"))
        .forEach((k) => localStorage.removeItem(k));
      setIsOnboarded(false);
      setProfile(null);
      setRoadmap(null);
      setCurrentDay(1);
      setTasks([]);
      setStreak(0);
      setPenaltiesThisWeek(0);
      setTotalExtraDays(0);
      stopTimer("reset");
      setDayLocked(false);
      setSystemEvents([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <Header
        targetRole={profile?.targetRole || ""}
        currentDay={currentDay}
        totalDays={(roadmap?.totalDays || 60) + (roadmap?.penaltyDays || 0)}
        streak={streak}
        timerSeconds={timerSeconds}
        timerActive={timerActive}
        onReset={handleReset}
        userEmail={session?.user.email || null}
        onSignOut={() => signOut()}
        onOpenWeeklyReview={() => setIsWeeklyReviewOpen(true)}
        onTriggerTestClap={() => {
          audioService.playClapAudio();
          logEvent("[EVENT: PLAY_CLAP_AUDIO]", "Manual Audio API applause test");
        }}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!isOnboarded ? (
          <div className="py-6 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <Badge variant="outline">CAREER COACH INITIALIZATION</Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                PathPilot Career Accountability
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No vague goals. We build a phased roadmap tailored to your exact hours, assign daily tasks, and track execution with firm discipline.
              </p>
            </div>

            <OnboardingWizard onComplete={handleWizardSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* View Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-border font-mono text-xs">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "tasks"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Daily Tasks</span>
                <span className="px-1.5 py-0.2 bg-surface-subtle border border-border text-[10px] rounded-[2px]">
                  {tasks.filter((t) => !t.completed).length} pending
                </span>
              </button>

              <button
                onClick={() => setActiveTab("roadmap")}
                className={`px-4 py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "roadmap"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Roadmap</span>
                <span className="text-[10px] text-muted-foreground">
                  ({roadmap?.phases.length} Phases)
                </span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "chat"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Coach Dialogue</span>
              </button>
            </div>

            {/* TAB 1: DAILY TASKS */}
            {activeTab === "tasks" && roadmap && (
              <DailyTasks
                currentDay={currentDay}
                totalDays={roadmap.totalDays + (roadmap.penaltyDays || 0)}
                tasks={tasks}
                timerActive={timerActive}
                dayLocked={dayLocked}
                timerSeconds={timerSeconds}
                onToggleTask={handleToggleTask}
                onStart24hTimer={handleStart24hTimer}
                onOpenCheckin={() => setIsCheckinOpen(true)}
                onAskExplanation={handleAskExplanation}
                explanationState={explanationState}
              />
            )}

            {/* TAB 2: ROADMAP */}
            {activeTab === "roadmap" && roadmap && (
              <RoadmapView
                roadmap={roadmap}
                onConfirm={handleConfirmRoadmap}
                onUpdatePhaseDays={handleUpdatePhaseDays}
              />
            )}

            {/* TAB 3: COACH CHAT */}
            {activeTab === "chat" && (
              <CoachChat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isCoachThinking}
              />
            )}
          </div>
        )}
      </main>

      {/* End-of-Day Check-in Modal */}
      {roadmap && (
        <CheckinModal
          isOpen={isCheckinOpen}
          onClose={() => setIsCheckinOpen(false)}
          dayNumber={currentDay}
          totalDays={roadmap.totalDays + (roadmap.penaltyDays || 0)}
          tasks={tasks}
          currentStreak={streak}
          penaltiesThisWeek={penaltiesThisWeek}
          totalExtraDays={totalExtraDays}
          hardExcuseCount={hardExcuseCount}
          onSuccessCheckin={handleSuccessCheckin}
          onRescheduleTasks={handleRescheduleTasks}
          onAddPenaltyDay={handleAddPenaltyDay}
          onLogEvent={logEvent}
          onRestDayApproved={() => {
            logEvent("[EVENT: REST_DAY_APPROVED]", "Burnout prevention rest day granted with zero penalty");
            stopTimer("rest_day");
          }}
        />
      )}

      {/* Weekly Review Modal (every 7 days) */}
      <WeeklyReviewModal
        isOpen={isWeeklyReviewOpen}
        onClose={() => {
          setIsWeeklyReviewOpen(false);
          setPenaltiesThisWeek(0); // Reset weekly penalty counter
        }}
        weekNumber={Math.max(1, Math.floor(currentDay / 7))}
        completionRate={tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 100}
        currentStreak={streak}
        penaltiesAdded={totalExtraDays}
        improvementTip="Maintain a fixed morning study block. Protect that 24-hour accountability window."
      />

      {/* Sign-in required before the roadmap is generated (no guest mode) */}
      <LoginGateModal
        isOpen={authReady && !session && (!!pendingOnboarding || isOnboarded)}
        roleLabel={pendingOnboarding?.targetRole || profile?.targetRole}
      />

      {/* Real-time System Event Drawer */}
      <EventDrawer
        events={systemEvents}
        onClear={() => setSystemEvents([])}
      />
    </div>
  );
}

