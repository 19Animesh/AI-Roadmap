// PathPilot Standalone Application Engine
// Handles state, event bus, timer, audio triggers, excuse classification, and AI mentor simulation.

(function () {
  const {
    PREDEFINED_CURRICULA,
    generateCustomRoadmap,
    classifyExcuse,
    MOTIVATIONAL_AND_FUNNY_QUOTES,
  } = window.PathPilotData;

  // State object
  const state = {
    profile: null,
    roadmap: null,
    currentDay: 1,
    tasks: [],
    streak: 0,
    penaltiesThisWeek: 0,
    totalExtraDays: 0,
    hardExcuseCount: 0,
    timer: {
      active: false,
      seconds: 86400,
      endsAt: null,
      intervalId: null,
    },
    // True when today's tasks are done but the 24h window is still running.
    // The next day unlocks only when that window ends.
    dayLocked: false,
    lastQuoteIndex: -1,
    events: [],
    activeTab: "tasks",
  };

  // DOM Elements
  const el = {
    headerRole: document.getElementById("header-role"),
    headerDay: document.getElementById("header-day"),
    headerStreak: document.getElementById("header-streak"),
    headerTimer: document.getElementById("header-timer"),
    btnTestClap: document.getElementById("btn-test-clap"),
    btnMute: document.getElementById("btn-mute"),
    btnReset: document.getElementById("btn-reset"),

    viewOnboarding: document.getElementById("view-onboarding"),
    viewMain: document.getElementById("view-main"),

    // Tabs
    tabTasks: document.getElementById("tab-tasks"),
    tabRoadmap: document.getElementById("tab-roadmap"),
    tabChat: document.getElementById("tab-chat"),
    panelTasks: document.getElementById("panel-tasks"),
    panelRoadmap: document.getElementById("panel-roadmap"),
    panelChat: document.getElementById("panel-chat"),

    // Onboarding Elements
    onboardingStep: document.getElementById("onboarding-step-num"),
    onboardingContainer: document.getElementById("onboarding-step-container"),

    // Roadmap Elements
    roadmapTitle: document.getElementById("roadmap-title"),
    roadmapDesc: document.getElementById("roadmap-desc"),
    roadmapDays: document.getElementById("roadmap-days"),
    roadmapPhasesContainer: document.getElementById("roadmap-phases-container"),
    btnConfirmRoadmap: document.getElementById("btn-confirm-roadmap"),
    roadmapConfirmBanner: document.getElementById("roadmap-confirm-banner"),

    // Tasks Elements
    taskDayTitle: document.getElementById("task-day-title"),
    taskProgressCount: document.getElementById("task-progress-count"),
    taskWorkloadEstimate: document.getElementById("task-workload-estimate"),
    taskListContainer: document.getElementById("task-list-container"),
    btnOpenCheckin: document.getElementById("btn-open-checkin"),
    understandingSection: document.getElementById("understanding-section"),
    btnUnderstandAll: document.getElementById("btn-understand-all"),
    btnUnderstandNeedHelp: document.getElementById("btn-understand-need-help"),
    understandingStatusNotice: document.getElementById("understanding-status-notice"),
    dayLockedPanel: document.getElementById("day-locked-panel"),
    dayLockedTitle: document.getElementById("day-locked-title"),
    dayLockedCountdown: document.getElementById("day-locked-countdown"),
    explanationContainer: document.getElementById("explanation-container"),

    // Checkin Modal Elements
    checkinModal: document.getElementById("checkin-modal"),
    checkinClose: document.getElementById("checkin-close"),
    checkinTitle: document.getElementById("checkin-title"),
    checkinReviewView: document.getElementById("checkin-review-view"),
    checkinCelebrationView: document.getElementById("checkin-celebration-view"),
    checkinReasonView: document.getElementById("checkin-reason-view"),
    checkinRescheduledView: document.getElementById("checkin-rescheduled-view"),
    checkinPenaltyView: document.getElementById("checkin-penalty-view"),
    checkinUnclearView: document.getElementById("checkin-unclear-view"),
    checkinReviewTaskList: document.getElementById("checkin-review-task-list"),
    btnProceedAllCompleted: document.getElementById("btn-proceed-all-completed"),
    btnProceedReasonReview: document.getElementById("btn-proceed-reason-review"),
    btnRestDayOption: document.getElementById("btn-rest-day-option"),
    reasonInput: document.getElementById("reason-input"),
    btnSubmitReason: document.getElementById("btn-submit-reason"),
    firmWarningBox: document.getElementById("firm-warning-box"),
    rotatedQuoteText: document.getElementById("rotated-quote-text"),
    penaltyCountNotice: document.getElementById("penalty-count-notice"),
    btnAcceptPenalty: document.getElementById("btn-accept-penalty"),
    btnAcknowledgeReschedule: document.getElementById("btn-acknowledge-reschedule"),
    btnAdvanceNextDay: document.getElementById("btn-advance-next-day"),

    // Event Drawer
    eventDrawer: document.getElementById("event-drawer"),
    eventDrawerHeader: document.getElementById("event-drawer-header"),
    eventDrawerCount: document.getElementById("event-drawer-count"),
    eventList: document.getElementById("event-list"),
    btnClearEvents: document.getElementById("btn-clear-events"),

    // Weekly Review Modal
    weeklyReviewModal: document.getElementById("weekly-review-modal"),
    weeklyReviewClose: document.getElementById("weekly-review-close"),
    weeklyWeekNum: document.getElementById("weekly-week-num"),
    weeklyDonePct: document.getElementById("weekly-done-pct"),
    weeklyStreakDays: document.getElementById("weekly-streak-days"),
    weeklyPenalties: document.getElementById("weekly-penalties"),
    btnDismissWeeklyReview: document.getElementById("btn-dismiss-weekly-review"),

    // Chat Elements
    chatThread: document.getElementById("chat-thread"),
    chatForm: document.getElementById("chat-form"),
    chatInput: document.getElementById("chat-input"),
  };

  // Helper: Format seconds to HH:MM:SS
  function formatSeconds(sec) {
    if (sec <= 0) return "00:00:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  // Event Logger
  function logEvent(tag, details = "") {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    state.events.unshift({ tag, details, timestamp });
    renderEvents();
  }

  function renderEvents() {
    el.eventDrawerCount.textContent = state.events.length;
    el.eventList.innerHTML = state.events
      .map(
        (ev) => `
        <div class="event-entry">
          <span class="event-timestamp">[${ev.timestamp}]</span>
          <div>
            <div class="event-tag-highlight">${escapeHtml(ev.tag)}</div>
            ${ev.details ? `<div style="color:var(--text-muted);font-size:10px">${escapeHtml(ev.details)}</div>` : ""}
          </div>
        </div>
      `
      )
      .join("");
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Timer Engine
  // Remaining time is always derived from timer.endsAt, so it stays correct
  // across reloads, sleeping tabs, and day transitions.
  function secondsUntilTimerEnds() {
    if (!state.timer.endsAt) return 0;
    return Math.max(0, Math.floor((new Date(state.timer.endsAt).getTime() - Date.now()) / 1000));
  }

  function isTimerRunning() {
    return secondsUntilTimerEnds() > 0;
  }

  function tickTimer() {
    state.timer.seconds = secondsUntilTimerEnds();
    if (state.timer.seconds <= 0) {
      handleTimerExpired();
      return;
    }
    updateHeader();
    updateDayLockedCountdown();
  }

  function startTimerTicker() {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.intervalId = setInterval(tickTimer, 1000);
  }

  function stopTimer() {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.active = false;
    state.timer.endsAt = null;
    state.timer.seconds = 86400;
  }

  function handleTimerExpired() {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.seconds = 0;
    state.timer.active = false;

    if (state.dayLocked) {
      logEvent("[EVENT: DAY_UNLOCKED]", `24-hour window ended. Day ${state.currentDay + 1} unlocked.`);
      unlockNextDay();
      return;
    }
    updateHeader();
    renderTasks();
    saveToStorage();
  }

  function start24hTimer() {
    // Never restart a window that is still running.
    if (state.dayLocked || isTimerRunning()) return;

    state.timer.active = true;
    state.timer.seconds = 86400;
    state.timer.endsAt = new Date(Date.now() + 86400 * 1000).toISOString();
    startTimerTicker();

    logEvent(
      "[EVENT: START_TIMER_24H]",
      `End timestamp: ${new Date(state.timer.endsAt).toLocaleTimeString()}`
    );
    window.soundEngine.playStartChime();
    updateHeader();
    renderTasks();
    saveToStorage();
  }

  function updateHeader() {
    if (!state.profile) {
      el.headerRole.textContent = "";
      el.headerDay.textContent = "Day 1";
      el.headerStreak.textContent = "0d";
      el.headerTimer.textContent = "24:00:00";
      return;
    }
    el.headerRole.textContent = "/ " + state.profile.targetRole;
    const totalWithPenalties =
      (state.roadmap?.totalDays || 60) + (state.roadmap?.penaltyDays || 0);
    el.headerDay.textContent = `Day ${state.currentDay}/${totalWithPenalties}`;
    el.headerStreak.textContent = `${state.streak}d`;
    el.headerTimer.textContent = formatSeconds(state.timer.seconds);

    const timerIndicator = document.getElementById("header-timer-indicator");
    if (timerIndicator) {
      if (state.timer.active) {
        timerIndicator.classList.add("active");
      } else {
        timerIndicator.classList.remove("active");
      }
    }
  }

  // Storage persistence
  function saveToStorage() {
    try {
      localStorage.setItem("pathpilot_app_state", JSON.stringify({
        profile: state.profile,
        roadmap: state.roadmap,
        currentDay: state.currentDay,
        tasks: state.tasks,
        streak: state.streak,
        penaltiesThisWeek: state.penaltiesThisWeek,
        totalExtraDays: state.totalExtraDays,
        hardExcuseCount: state.hardExcuseCount,
        timerActive: state.timer.active,
        timerEndsAt: state.timer.endsAt,
        dayLocked: state.dayLocked,
        lastQuoteIndex: state.lastQuoteIndex,
      }));
    } catch (e) {
      console.warn("Storage notice:", e);
    }
  }

  function loadFromStorage() {
    try {
      const data = localStorage.getItem("pathpilot_app_state");
      if (!data) return false;
      const parsed = JSON.parse(data);
      if (!parsed.profile || !parsed.roadmap) return false;

      state.profile = parsed.profile;
      state.roadmap = parsed.roadmap;
      state.currentDay = parsed.currentDay || 1;
      state.tasks = parsed.tasks || [];
      state.streak = parsed.streak || 0;
      state.penaltiesThisWeek = parsed.penaltiesThisWeek || 0;
      state.totalExtraDays = parsed.totalExtraDays || 0;
      state.hardExcuseCount = parsed.hardExcuseCount || 0;
      state.lastQuoteIndex = parsed.lastQuoteIndex || -1;

      state.dayLocked = !!parsed.dayLocked;

      if (parsed.timerEndsAt) {
        state.timer.endsAt = parsed.timerEndsAt;
        const diff = secondsUntilTimerEnds();
        if (diff > 0) {
          state.timer.seconds = diff;
          state.timer.active = true;
          startTimerTicker();
        } else {
          state.timer.seconds = 0;
          state.timer.active = false;
        }
      }

      // Window ended while the app was closed: unlock the next day now.
      if (state.dayLocked && !isTimerRunning()) {
        unlockNextDay();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Onboarding Wizard Logic
  let onboardingStepNum = 1;
  const onboardingTemp = {
    targetRole: "Frontend Developer",
    skillLevel: "beginner",
    background: "",
    hoursPerDay: 2,
    targetDays: 60,
    learningStyle: "hands-on projects",
  };

  function renderOnboardingStep() {
    el.onboardingStep.textContent = onboardingStepNum;

    if (onboardingStepNum === 1) {
      el.onboardingContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Step 1 of 4: Target Career Goal</label>
          <div class="form-help mb-3">Select a recommended discipline or type your specific goal.</div>
          <div class="chip-group mb-3">
            <div class="chip-option ${onboardingTemp.targetRole === "Frontend Developer" ? "selected" : ""}" data-role="Frontend Developer">Frontend Developer</div>
            <div class="chip-option ${onboardingTemp.targetRole === "Full-Stack Developer" ? "selected" : ""}" data-role="Full-Stack Developer">Full-Stack Developer</div>
            <div class="chip-option ${onboardingTemp.targetRole === "Data Analyst" ? "selected" : ""}" data-role="Data Analyst">Data Analyst</div>
            <div class="chip-option ${onboardingTemp.targetRole === "Machine Learning Engineer" ? "selected" : ""}" data-role="Machine Learning Engineer">Machine Learning Engineer</div>
            <div class="chip-option ${onboardingTemp.targetRole === "Backend Engineer" ? "selected" : ""}" data-role="Backend Engineer">Backend Engineer</div>
          </div>
          <input type="text" id="ob-custom-role" class="form-input" value="${escapeHtml(onboardingTemp.targetRole)}" placeholder="Or type custom role..." />
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button id="ob-next-1" class="btn btn-primary">Continue to Background →</button>
        </div>
      `;

      el.onboardingContainer.querySelectorAll(".chip-option").forEach((chip) => {
        chip.addEventListener("click", () => {
          onboardingTemp.targetRole = chip.getAttribute("data-role");
          document.getElementById("ob-custom-role").value = onboardingTemp.targetRole;
          renderOnboardingStep();
        });
      });

      document.getElementById("ob-custom-role").addEventListener("input", (e) => {
        onboardingTemp.targetRole = e.target.value;
      });

      document.getElementById("ob-next-1").addEventListener("click", () => {
        if (!onboardingTemp.targetRole.trim()) return;
        onboardingStepNum = 2;
        renderOnboardingStep();
      });
    } else if (onboardingStepNum === 2) {
      el.onboardingContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Step 2 of 4: Skill Level and Background</label>
          <div class="form-help mb-2">Be accurate so PathPilot avoids trivial or overwhelmingly hard tasks.</div>
          <div class="chip-group mb-3">
            <div class="chip-option ${onboardingTemp.skillLevel === "beginner" ? "selected" : ""}" data-lvl="beginner">Beginner (Little to no experience)</div>
            <div class="chip-option ${onboardingTemp.skillLevel === "intermediate" ? "selected" : ""}" data-lvl="intermediate">Intermediate (Some foundation)</div>
            <div class="chip-option ${onboardingTemp.skillLevel === "advanced" ? "selected" : ""}" data-lvl="advanced">Advanced (Targeting gaps)</div>
          </div>
          <label class="form-label">Background Details</label>
          <textarea id="ob-background" class="form-textarea" placeholder="e.g. Self-taught basic Python, non-technical degree, looking for junior roles">${escapeHtml(onboardingTemp.background)}</textarea>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <button id="ob-back-2" class="btn btn-secondary">← Back</button>
          <button id="ob-next-2" class="btn btn-primary">Continue to Schedule →</button>
        </div>
      `;

      el.onboardingContainer.querySelectorAll(".chip-option").forEach((chip) => {
        chip.addEventListener("click", () => {
          onboardingTemp.skillLevel = chip.getAttribute("data-lvl");
          renderOnboardingStep();
        });
      });

      document.getElementById("ob-background").addEventListener("input", (e) => {
        onboardingTemp.background = e.target.value;
      });

      document.getElementById("ob-back-2").addEventListener("click", () => {
        onboardingStepNum = 1;
        renderOnboardingStep();
      });

      document.getElementById("ob-next-2").addEventListener("click", () => {
        onboardingStepNum = 3;
        renderOnboardingStep();
      });
    } else if (onboardingStepNum === 3) {
      el.onboardingContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Step 3 of 4: Time Commitment & Deadline</label>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span class="form-help">Hours Available Per Day:</span>
            <span id="hours-display" class="font-mono" style="font-weight:700;">${onboardingTemp.hoursPerDay} hours/day</span>
          </div>
          <input type="range" id="ob-hours" min="1" max="8" step="0.5" value="${onboardingTemp.hoursPerDay}" style="width:100%;margin-bottom:14px;" />

          <label class="form-label">Target Timeline</label>
          <div class="chip-group mb-2">
            <div class="chip-option ${onboardingTemp.targetDays === 30 ? "selected" : ""}" data-days="30">30 Days</div>
            <div class="chip-option ${onboardingTemp.targetDays === 60 ? "selected" : ""}" data-days="60">60 Days</div>
            <div class="chip-option ${onboardingTemp.targetDays === 90 ? "selected" : ""}" data-days="90">90 Days</div>
            <div class="chip-option ${onboardingTemp.targetDays === 120 ? "selected" : ""}" data-days="120">120 Days</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <button id="ob-back-3" class="btn btn-secondary">← Back</button>
          <button id="ob-next-3" class="btn btn-primary">Continue to Learning Style →</button>
        </div>
      `;

      const slider = document.getElementById("ob-hours");
      slider.addEventListener("input", (e) => {
        onboardingTemp.hoursPerDay = parseFloat(e.target.value);
        document.getElementById("hours-display").textContent = `${onboardingTemp.hoursPerDay} hours/day`;
      });

      el.onboardingContainer.querySelectorAll(".chip-option").forEach((chip) => {
        chip.addEventListener("click", () => {
          onboardingTemp.targetDays = parseInt(chip.getAttribute("data-days"), 10);
          renderOnboardingStep();
        });
      });

      document.getElementById("ob-back-3").addEventListener("click", () => {
        onboardingStepNum = 2;
        renderOnboardingStep();
      });

      document.getElementById("ob-next-3").addEventListener("click", () => {
        onboardingStepNum = 4;
        renderOnboardingStep();
      });
    } else if (onboardingStepNum === 4) {
      el.onboardingContainer.innerHTML = `
        <div class="form-group">
          <label class="form-label">Step 4 of 4: Preferred Learning Style</label>
          <div class="chip-group mb-4">
            <div class="chip-option ${onboardingTemp.learningStyle === "hands-on projects" ? "selected" : ""}" data-style="hands-on projects">Hands-on Projects & Building</div>
            <div class="chip-option ${onboardingTemp.learningStyle === "reading documentation" ? "selected" : ""}" data-style="reading documentation">Reading Documentation & Specs</div>
            <div class="chip-option ${onboardingTemp.learningStyle === "structured videos" ? "selected" : ""}" data-style="structured videos">Structured Videos & Practice</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <button id="ob-back-4" class="btn btn-secondary">← Back</button>
          <button id="ob-finish" class="btn btn-primary">Generate Roadmap →</button>
        </div>
      `;

      el.onboardingContainer.querySelectorAll(".chip-option").forEach((chip) => {
        chip.addEventListener("click", () => {
          onboardingTemp.learningStyle = chip.getAttribute("data-style");
          renderOnboardingStep();
        });
      });

      document.getElementById("ob-back-4").addEventListener("click", () => {
        onboardingStepNum = 3;
        renderOnboardingStep();
      });

      document.getElementById("ob-finish").addEventListener("click", () => {
        finishOnboarding();
      });
    }
  }

  function finishOnboarding() {
    state.profile = { ...onboardingTemp };
    const slug = state.profile.targetRole.toLowerCase().replace(/\s+/g, "-");
    const predefined = PREDEFINED_CURRICULA[slug];

    if (predefined) {
      state.roadmap = {
        title: predefined.roleName,
        description: predefined.description,
        totalDays: state.profile.targetDays,
        penaltyDays: 0,
        phases: JSON.parse(JSON.stringify(predefined.phases)),
        isConfirmed: false,
      };
    } else {
      const generated = generateCustomRoadmap(
        state.profile.targetRole,
        state.profile.background,
        state.profile.skillLevel,
        state.profile.hoursPerDay,
        state.profile.targetDays,
        state.profile.learningStyle
      );
      state.roadmap = {
        title: generated.roleName,
        description: generated.description,
        totalDays: generated.defaultTimelineDays,
        penaltyDays: 0,
        phases: generated.phases,
        isConfirmed: false,
      };
    }

    // Set Day 1 tasks from Phase 1
    const p1 = state.roadmap.phases[0];
    state.tasks = (p1?.sampleDailyTasks || []).map((t, idx) => ({
      id: `task-1-${idx + 1}`,
      title: t.title,
      minutes: t.minutes,
      resource: t.resource,
      hint: t.hint,
      description: t.description,
      completed: false,
    }));

    el.viewOnboarding.style.display = "none";
    el.viewMain.style.display = "block";
    const navBar = document.getElementById("main-nav-bar");
    if (navBar) navBar.style.display = "flex";
    if (el.headerRole) el.headerRole.style.display = "inline-block";
    switchTab("roadmap");

    logEvent(
      "[EVENT: ONBOARDING_COMPLETED]",
      `Target: ${state.profile.targetRole} (${state.profile.targetDays} days)`
    );

    updateHeader();
    renderRoadmap();
    renderTasks();
    saveToStorage();
  }

  // Switch Active Tab
  function switchTab(tabName) {
    state.activeTab = tabName;
    el.tabTasks.classList.remove("active");
    el.tabRoadmap.classList.remove("active");
    el.tabChat.classList.remove("active");

    el.panelTasks.classList.remove("active");
    el.panelRoadmap.classList.remove("active");
    el.panelChat.classList.remove("active");

    if (tabName === "tasks") {
      el.tabTasks.classList.add("active");
      el.panelTasks.classList.add("active");
    } else if (tabName === "roadmap") {
      el.tabRoadmap.classList.add("active");
      el.panelRoadmap.classList.add("active");
    } else if (tabName === "chat") {
      el.tabChat.classList.add("active");
      el.panelChat.classList.add("active");
    }
  }

  // Render Roadmap View
  function renderRoadmap() {
    if (!state.roadmap) return;
    el.roadmapTitle.textContent = state.roadmap.title;
    el.roadmapDesc.textContent = state.roadmap.description;

    const totalDays = state.roadmap.phases.reduce((sum, p) => sum + p.days, 0) + (state.roadmap.penaltyDays || 0);
    el.roadmapDays.textContent = `${totalDays} Days`;

    if (state.roadmap.isConfirmed) {
      el.roadmapConfirmBanner.style.display = "none";
      el.btnConfirmRoadmap.style.display = "none";
    } else {
      el.roadmapConfirmBanner.style.display = "flex";
      el.btnConfirmRoadmap.style.display = "inline-flex";
    }

    el.roadmapPhasesContainer.innerHTML = state.roadmap.phases
      .map(
        (phase, idx) => `
        <div class="phase-card">
          <div class="phase-header">
            <div class="phase-title-text">${idx + 1}. ${escapeHtml(phase.name)}</div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="phase-days-badge">${phase.days} Days</span>
              ${
                !state.roadmap.isConfirmed
                  ? `<button class="btn btn-secondary btn-sm" data-edit-phase="${idx}">Adjust Days</button>`
                  : ""
              }
            </div>
          </div>
          <div class="phase-deliverable-box">
            <div class="deliverable-label">What You Will Be Able to Do at End of Phase:</div>
            <div style="color:var(--text-primary);">${escapeHtml(phase.deliverable)}</div>
          </div>
          <div class="deliverable-label">Core Milestones:</div>
          <ul class="milestones-list">
            ${phase.milestones
              .map(
                (m) => `
              <li class="milestone-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span>${escapeHtml(m)}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
      )
      .join("");

    // Hook up adjust buttons
    el.roadmapPhasesContainer.querySelectorAll("[data-edit-phase]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pIdx = parseInt(btn.getAttribute("data-edit-phase"), 10);
        const current = state.roadmap.phases[pIdx].days;
        const val = prompt(`Enter new days estimate for ${state.roadmap.phases[pIdx].name}:`, current);
        if (val && !isNaN(parseInt(val))) {
          state.roadmap.phases[pIdx].days = Math.max(1, parseInt(val));
          renderRoadmap();
          updateHeader();
          saveToStorage();
        }
      });
    });
  }

  // Render Daily Tasks View
  function updateDayLockedCountdown() {
    if (state.dayLocked && el.dayLockedCountdown) {
      el.dayLockedCountdown.textContent = formatSeconds(state.timer.seconds);
    }
  }

  function renderTasks() {
    el.taskDayTitle.textContent = `Day ${state.currentDay}`;

    // Locked: today is done, waiting for the 24h window to end.
    const locked = state.dayLocked;
    el.dayLockedPanel.style.display = locked ? "block" : "none";
    el.taskListContainer.style.display = locked ? "none" : "";
    el.understandingSection.style.display = locked ? "none" : "";
    el.explanationContainer.style.display = locked ? "none" : "";
    el.btnOpenCheckin.style.display = locked ? "none" : "";
    if (locked) {
      el.dayLockedTitle.textContent = `Day ${state.currentDay} complete. Day ${state.currentDay + 1} unlocks when your 24-hour window ends.`;
      updateDayLockedCountdown();
    }
    const completedCount = state.tasks.filter((t) => t.completed).length;
    el.taskProgressCount.textContent = `${completedCount} of ${state.tasks.length} Completed`;

    const totalMin = state.tasks.reduce((sum, t) => sum + t.minutes, 0);
    el.taskWorkloadEstimate.textContent = `${totalMin} min (~${(totalMin / 60).toFixed(1)} hrs)`;

    el.taskListContainer.innerHTML = state.tasks
      .map(
        (task, idx) => `
        <div class="task-item-card ${task.completed ? "completed" : ""}">
          <div class="task-header-row">
            <label class="task-checkbox-label" data-task-id="${task.id}">
              <div class="task-checkbox-custom">
                ${task.completed ? '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ""}
              </div>
              <div>
                <span class="task-title">${idx + 1}. ${escapeHtml(task.title)}</span>
              </div>
            </label>
            <span class="task-meta-time">${task.minutes} min</span>
          </div>
          <div class="task-description">${escapeHtml(task.description)}</div>
          <div class="task-details-footer">
            <div class="task-resource-box">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span><strong>Free Resource:</strong> ${escapeHtml(task.resource)}</span>
            </div>
            <div class="task-hint-box">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span><strong>Hint:</strong> ${escapeHtml(task.hint)}</span>
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <button class="btn btn-outline btn-sm" data-simplify-task="${task.id}">Ask Coach to simplify this task</button>
          </div>
        </div>
      `
      )
      .join("");

    // Task toggle listeners
    el.taskListContainer.querySelectorAll(".task-checkbox-label").forEach((lbl) => {
      lbl.addEventListener("click", (e) => {
        e.preventDefault();
        const id = lbl.getAttribute("data-task-id");
        const t = state.tasks.find((item) => item.id === id);
        if (t) {
          t.completed = !t.completed;
          window.soundEngine.playClickTone();
          renderTasks();
          saveToStorage();
        }
      });
    });

    // Simplify task listener
    el.taskListContainer.querySelectorAll("[data-simplify-task]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-simplify-task");
        const t = state.tasks.find((item) => item.id === id);
        if (t) {
          explainTaskInSimplerWords(t);
        }
      });
    });

    // Understanding check state
    if (state.timer.active) {
      el.btnUnderstandAll.style.display = "none";
      el.btnUnderstandNeedHelp.style.display = "none";
      el.understandingStatusNotice.style.display = "block";
    } else {
      el.btnUnderstandAll.style.display = "inline-flex";
      el.btnUnderstandNeedHelp.style.display = "inline-flex";
      el.understandingStatusNotice.style.display = "none";
    }
  }

  function explainTaskInSimplerWords(task) {
    const explanation = `Here is a simpler way to think about "${task.title}":\n\nInstead of trying to solve everything at once, isolate the smallest proof of concept first. For example, if building a grid layout, write just two empty boxes and verify they sit side-by-side on your screen before adding content.\n\nResource hint: ${task.hint}`;
    el.explanationContainer.innerHTML = `
      <div class="explanation-card">
        <div style="font-size:11px;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;">
          PathPilot Explanation for: ${escapeHtml(task.title)}
        </div>
        <div style="font-size:13px;line-height:1.6;color:var(--text-primary);white-space:pre-wrap;">${escapeHtml(explanation)}</div>
      </div>
    `;
    el.explanationContainer.scrollIntoView({ behavior: "smooth" });
  }

  // Check-in Modal Handlers
  function openCheckinModal() {
    el.checkinModal.classList.add("active");
    setCheckinView("review");

    const completed = state.tasks.filter((t) => t.completed).length;
    const allDone = state.tasks.length > 0 && completed === state.tasks.length;

    el.checkinReviewTaskList.innerHTML = state.tasks
      .map(
        (t) => `
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
          <span style="${t.completed ? "text-decoration:line-through;color:var(--text-muted);" : "font-weight:600;"}">
            ${escapeHtml(t.title)}
          </span>
          <span class="tag-badge font-mono">${t.completed ? "DONE" : "MISSED"}</span>
        </div>
      `
      )
      .join("");

    if (allDone) {
      el.btnProceedAllCompleted.style.display = "inline-flex";
      el.btnProceedReasonReview.style.display = "none";
    } else {
      el.btnProceedAllCompleted.style.display = "none";
      el.btnProceedReasonReview.style.display = "inline-flex";
    }
  }

  function setCheckinView(viewName) {
    el.checkinReviewView.style.display = viewName === "review" ? "block" : "none";
    el.checkinCelebrationView.style.display = viewName === "celebration" ? "block" : "none";
    el.checkinReasonView.style.display = viewName === "reason" ? "block" : "none";
    el.checkinRescheduledView.style.display = viewName === "rescheduled" ? "block" : "none";
    el.checkinPenaltyView.style.display = viewName === "penalty" ? "block" : "none";
    el.checkinUnclearView.style.display = viewName === "unclear" ? "block" : "none";
  }

  function handleCheckinCompletedAll() {
    // All completed
    logEvent("[EVENT: PLAY_CLAP_AUDIO]", "Applause audio synthesis triggered");
    logEvent(
      '[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]',
      "Celebration screen displayed"
    );
    window.soundEngine.playClapAudio();

    state.streak++;
    const totalDays = (state.roadmap?.totalDays || 60) + (state.roadmap?.penaltyDays || 0);
    const progressPct = Math.min(100, Math.round((state.currentDay / totalDays) * 100));

    document.getElementById("celebration-streak-val").textContent = `+${state.streak} Days`;
    document.getElementById("celebration-progress-val").textContent = `${progressPct}%`;

    setCheckinView("celebration");
    saveToStorage();
  }

  function handleSubmitReason() {
    const text = el.reasonInput.value.trim();
    if (!text) return;

    const classification = classifyExcuse(text);

    if (classification.type === "valid") {
      logEvent(
        "[EVENT: RESCHEDULE_TASKS]",
        `Reason accepted as valid: "${text}". Tasks broken down.`
      );
      state.hardExcuseCount++;
      stopTimer();

      // Reschedule: replace current tasks with smaller subtasks
      state.tasks = [
        {
          id: `subtask-${Date.now()}-1`,
          title: "Isolate syntax fundamentals & minimal reproduction (30 min)",
          minutes: 30,
          resource: "Official Language Documentation",
          hint: "Focus strictly on writing 1 small unit test that passes.",
          description: "Simplified subtask deconstructed by PathPilot mentor.",
          completed: false,
        },
        {
          id: `subtask-${Date.now()}-2`,
          title: "Implement core solution without edge-cases (35 min)",
          minutes: 35,
          resource: "MDN / Official Spec Tutorials",
          hint: "Keep code imperative and clean.",
          description: "Second milestone of the simplified task breakdown.",
          completed: false,
        },
      ];

      setCheckinView("rescheduled");
      renderTasks();
      updateHeader();
      saveToStorage();
      return;
    }

    if (classification.type === "invalid") {
      // Rotate quotes
      let nextQIdx = Math.floor(Math.random() * MOTIVATIONAL_AND_FUNNY_QUOTES.length);
      if (nextQIdx === state.lastQuoteIndex) {
        nextQIdx = (nextQIdx + 1) % MOTIVATIONAL_AND_FUNNY_QUOTES.length;
      }
      state.lastQuoteIndex = nextQIdx;
      const quote = MOTIVATIONAL_AND_FUNNY_QUOTES[nextQIdx];

      const canAddPenalty = state.penaltiesThisWeek < 2;
      if (canAddPenalty) {
        state.penaltiesThisWeek++;
        state.totalExtraDays++;
        if (state.roadmap) {
          state.roadmap.penaltyDays = (state.roadmap.penaltyDays || 0) + 1;
        }
        logEvent("[EVENT: ADD_DAY]", `+1 extra day added to roadmap. Reason: "${text}"`);
      } else {
        logEvent(
          "[EVENT: PENALTY_CAP_REACHED]",
          "Weekly penalty cap (2 days) reached. Roadmap review recommended."
        );
      }

      window.soundEngine.playWarningTone();
      el.rotatedQuoteText.textContent = `"${quote}"`;
      el.penaltyCountNotice.textContent = canAddPenalty
        ? `+1 day added to roadmap. Penalties this week: ${state.penaltiesThisWeek} / 2.`
        : `Weekly limit reached (2 penalties). Let's review roadmap difficulty instead of adding days.`;

      setCheckinView("penalty");
      updateHeader();
      saveToStorage();
      return;
    }

    // Unclear
    setCheckinView("unclear");
  }

  // Move to the next day: fresh tasks, timer back on standby until the user
  // confirms they understand the new tasks.
  function unlockNextDay() {
    state.dayLocked = false;
    stopTimer();
    state.currentDay++;

    const phaseIndex = Math.min(
      Math.floor((state.currentDay - 1) / Math.max(1, Math.floor((state.roadmap?.totalDays || 60) / 4))),
      (state.roadmap?.phases.length || 1) - 1
    );
    const activePhase = state.roadmap?.phases[phaseIndex];

    state.tasks = (activePhase?.sampleDailyTasks || []).map((t, idx) => ({
      id: `task-${state.currentDay}-${idx + 1}`,
      title: `${t.title}`,
      minutes: t.minutes,
      resource: t.resource,
      hint: t.hint,
      description: t.description,
      completed: false,
    }));
    el.explanationContainer.innerHTML = "";

    // Check weekly review
    if (state.currentDay % 7 === 1 && state.currentDay > 1) {
      setTimeout(() => {
        el.weeklyWeekNum.textContent = Math.floor(state.currentDay / 7);
        el.weeklyDonePct.textContent = "100%";
        el.weeklyStreakDays.textContent = `${state.streak}d`;
        el.weeklyPenalties.textContent = `${state.totalExtraDays}d`;
        el.weeklyReviewModal.classList.add("active");
      }, 800);
    }

    renderTasks();
    updateHeader();
    saveToStorage();
  }

  // Setup Event Listeners
  function initListeners() {
    // Confirm Roadmap
    el.btnConfirmRoadmap.addEventListener("click", () => {
      state.roadmap.isConfirmed = true;
      logEvent("[EVENT: ROADMAP_CONFIRMED]", "Phase distribution locked. Ready for Day 1.");
      renderRoadmap();
      switchTab("tasks");
      saveToStorage();
    });

    // Understand all tasks -> starts 24h timer
    el.btnUnderstandAll.addEventListener("click", () => {
      start24hTimer();
    });

    // Need help on task
    el.btnUnderstandNeedHelp.addEventListener("click", () => {
      if (state.tasks[0]) {
        explainTaskInSimplerWords(state.tasks[0]);
      }
    });

    // Checkin Modal
    el.btnOpenCheckin.addEventListener("click", openCheckinModal);
    el.checkinClose.addEventListener("click", () => el.checkinModal.classList.remove("active"));
    el.btnProceedAllCompleted.addEventListener("click", handleCheckinCompletedAll);

    el.btnProceedReasonReview.addEventListener("click", () => {
      setCheckinView("reason");
    });

    el.btnRestDayOption.addEventListener("click", () => {
      logEvent("[EVENT: REST_DAY_APPROVED]", "Burnout prevention rest day approved with zero penalty.");
      stopTimer();
      el.checkinModal.classList.remove("active");
      updateHeader();
      renderTasks();
      alert("Rest day scheduled. Take time to recover. We resume tomorrow with clear energy and zero penalties.");
      saveToStorage();
    });

    el.btnSubmitReason.addEventListener("click", handleSubmitReason);

    el.btnAcknowledgeReschedule.addEventListener("click", () => {
      el.checkinModal.classList.remove("active");
    });

    el.btnAcceptPenalty.addEventListener("click", () => {
      el.checkinModal.classList.remove("active");
    });

    el.btnAdvanceNextDay.addEventListener("click", () => {
      el.checkinModal.classList.remove("active");

      if (isTimerRunning()) {
        // Finished early: keep the current 24h window running and lock the
        // next day until it ends, instead of restarting the timer.
        state.dayLocked = true;
        logEvent(
          "[EVENT: DAY_LOCKED]",
          `Day ${state.currentDay + 1} unlocks at ${new Date(state.timer.endsAt).toLocaleTimeString()}`
        );
        renderTasks();
        updateHeader();
        saveToStorage();
        return;
      }

      unlockNextDay();
    });

    // Unclear follow-up buttons
    document.querySelectorAll("[data-unclear-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-unclear-choice");
        if (choice === "external") {
          el.reasonInput.value = "Unexpected external emergency / work overload";
        } else {
          el.reasonInput.value = "Distraction and procrastination";
        }
        handleSubmitReason();
      });
    });

    // Weekly Review Close
    el.weeklyReviewClose.addEventListener("click", () => el.weeklyReviewModal.classList.remove("active"));
    el.btnDismissWeeklyReview.addEventListener("click", () => {
      el.weeklyReviewModal.classList.remove("active");
      state.penaltiesThisWeek = 0; // Reset weekly penalty counter
      saveToStorage();
    });

    // Event Drawer Toggle
    el.eventDrawerHeader.addEventListener("click", () => {
      el.eventDrawer.classList.toggle("minimized");
    });
    el.btnClearEvents.addEventListener("click", () => {
      state.events = [];
      renderEvents();
    });

    // Test Audio
    el.btnTestClap.addEventListener("click", () => {
      window.soundEngine.playClapAudio();
      logEvent("[EVENT: PLAY_CLAP_AUDIO]", "Manual Audio API test");
    });

    // Mute Audio
    let isMuted = false;
    el.btnMute.addEventListener("click", () => {
      isMuted = !isMuted;
      window.soundEngine.enabled = !isMuted;
      el.btnMute.textContent = isMuted ? "Audio: Muted" : "Audio: On";
    });

    // Reset
    el.btnReset.addEventListener("click", () => {
      if (confirm("Reset current roadmap and daily streak?")) {
        localStorage.removeItem("pathpilot_app_state");
        window.location.reload();
      }
    });

    // Navigation Tabs
    el.tabTasks.addEventListener("click", () => switchTab("tasks"));
    el.tabRoadmap.addEventListener("click", () => switchTab("roadmap"));
    el.tabChat.addEventListener("click", () => switchTab("chat"));

    // Chat Submission
    el.chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = el.chatInput.value.trim();
      if (!txt) return;
      el.chatInput.value = "";

      appendChatMessage("user", txt);

      // Mentor reply
      setTimeout(() => {
        const lower = txt.toLowerCase();
        let reply = "Keep your commitment sharp. Complete the daily tasks before the timer runs out.";

        if (lower.includes("all completed") || lower.includes("finished")) {
          reply = `[EVENT: PLAY_CLAP_AUDIO]\n[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]\n\nExcellent work. You honored your daily promise. Take your rest.`;
          window.soundEngine.playClapAudio();
          logEvent("[EVENT: PLAY_CLAP_AUDIO]");
          logEvent('[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]');
        } else if (lower.includes("lazy") || lower.includes("procrastinat")) {
          reply = `[EVENT: ADD_DAY]\n⚠️ Warning: At this pace you will not reach your goal on time. You're moving too slow. Push harder!\n\n"Discipline is choosing between what you want now and what you want most."`;
          logEvent("[EVENT: ADD_DAY]");
        } else if (lower.includes("too hard") || lower.includes("stuck")) {
          reply = `[EVENT: RESCHEDULE_TASKS]\nI hear you. Break the problem down into the simplest test case possible. Don't worry about speed; focus on clarity.`;
          logEvent("[EVENT: RESCHEDULE_TASKS]");
        }

        appendChatMessage("coach", reply);
      }, 500);
    });
  }

  function appendChatMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = `
      <div style="font-size:10px;font-family:var(--font-mono);margin-bottom:4px;color:var(--text-muted);text-transform:uppercase;">
        ${role === "user" ? "YOU" : "PATHPILOT COACH"}
      </div>
      <div style="white-space:pre-wrap;">${escapeHtml(text)}</div>
    `;
    el.chatThread.appendChild(bubble);
    el.chatThread.scrollTop = el.chatThread.scrollHeight;
  }

  // App Initialization
  function init() {
    initListeners();
    const hasData = loadFromStorage();

    if (hasData) {
      el.viewOnboarding.style.display = "none";
      el.viewMain.style.display = "block";
      const navBar = document.getElementById("main-nav-bar");
      if (navBar) navBar.style.display = "flex";
      if (el.headerRole) el.headerRole.style.display = "inline-block";
      updateHeader();
      renderRoadmap();
      renderTasks();
      switchTab("tasks");
    } else {
      el.viewOnboarding.style.display = "block";
      el.viewMain.style.display = "none";
      renderOnboardingStep();
      updateHeader();
    }
  }

  init();
})();

