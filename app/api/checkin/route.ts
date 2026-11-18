import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { classifyExcuse, getNextQuote } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      dayNumber,
      allCompleted,
      missedTasks,
      reasonText,
      isRestDay,
      lastQuoteIndex,
    } = body;

    const supabase = createServerClient();

    // Fetch current user profile if available
    let profile = null;
    if (userId) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      profile = data;
    }

    const currentStreak = profile?.streak || 0;
    const penaltiesThisWeek = profile?.penalties_this_week || 0;
    const totalExtraDays = profile?.total_extra_days || 0;
    const hardExcuseCount = profile?.hard_excuse_count || 0;

    // CASE: REST DAY (Burnout protection)
    if (isRestDay) {
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            timer_active: false,
          })
          .eq("id", userId);

        await supabase.from("checkin_records").insert({
          user_id: userId,
          day_number: dayNumber || 1,
          outcome: "rest_day",
          user_reason: "Burnout prevention rest day",
          reason_type: "burnout",
          penalty_days_added: 0,
        });
      }

      return NextResponse.json({
        type: "rest_day",
        message: "Rest day approved. Resting when depleted is part of high performance. Recover today; we continue tomorrow with zero penalties.",
        events: [],
      });
    }

    // CASE A: ALL TASKS COMPLETED
    if (allCompleted) {
      const newStreak = currentStreak + 1;
      const nextDay = (dayNumber || 1) + 1;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            streak: newStreak,
            current_day: nextDay,
            timer_active: false,
          })
          .eq("id", userId);

        await supabase.from("checkin_records").insert({
          user_id: userId,
          day_number: dayNumber || 1,
          outcome: "all_completed",
          penalty_days_added: 0,
        });

        await supabase.from("event_logs").insert([
          {
            user_id: userId,
            event_tag: "[EVENT: PLAY_CLAP_AUDIO]",
          },
          {
            user_id: userId,
            event_tag: '[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]',
          },
        ]);
      }

      return NextResponse.json({
        type: "all_completed",
        events: [
          "[EVENT: PLAY_CLAP_AUDIO]",
          '[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]',
        ],
        streak: newStreak,
        nextDay,
        celebrationMessage: "Hurray! One step ahead on your journey! Outstanding execution today.",
      });
    }

    // CASE B: ANY TASK MISSED
    const classification = classifyExcuse(reasonText);

    if (classification.type === "valid") {
      // VALID REASON: Be empathetic, simplify task into 2-3 smaller tasks, reschedule
      const isRepeatedDifficulty = (classification.keyword === "hard" || classification.keyword === "too hard");
      const updatedHardCount = isRepeatedDifficulty ? hardExcuseCount + 1 : hardExcuseCount;

      let guidance = "I understand. Real life happens, and challenging concepts take iteration.";
      if (updatedHardCount >= 3) {
        guidance += " Notice: You have flagged tasks as too difficult 3 times now. Let us review your overall roadmap pace so you build mastery sustainably.";
      }

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            hard_excuse_count: updatedHardCount,
            timer_active: false,
          })
          .eq("id", userId);

        await supabase.from("checkin_records").insert({
          user_id: userId,
          day_number: dayNumber || 1,
          outcome: "has_missed",
          user_reason: reasonText,
          reason_type: "valid",
          penalty_days_added: 0,
        });

        await supabase.from("event_logs").insert({
          user_id: userId,
          event_tag: "[EVENT: RESCHEDULE_TASKS]",
          payload: { reason: reasonText },
        });
      }

      return NextResponse.json({
        type: "rescheduled",
        events: ["[EVENT: RESCHEDULE_TASKS]"],
        classification: "valid",
        guidance,
        subtasksCreated: [
          "Break down core concept and write minimal runnable example",
          "Trace error inputs and verify one test case at a time",
          "Consolidate solution and document key takeaways",
        ],
        message: "Task simplified and rescheduled across next days. Zero penalty applied.",
      });
    }

    if (classification.type === "invalid") {
      // INVALID REASON: Add one extra day, show firm warning and rotated quote
      const quoteData = getNextQuote(lastQuoteIndex ?? -1);
      const canAddPenalty = penaltiesThisWeek < 2;
      const penaltyToAdd = canAddPenalty ? 1 : 0;

      const newPenaltiesThisWeek = penaltiesThisWeek + penaltyToAdd;
      const newTotalExtraDays = totalExtraDays + penaltyToAdd;

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            penalties_this_week: newPenaltiesThisWeek,
            total_extra_days: newTotalExtraDays,
            timer_active: false,
          })
          .eq("id", userId);

        await supabase.from("checkin_records").insert({
          user_id: userId,
          day_number: dayNumber || 1,
          outcome: "has_missed",
          user_reason: reasonText,
          reason_type: "invalid",
          penalty_days_added: penaltyToAdd,
          quote_shown: quoteData.quote,
        });

        if (penaltyToAdd > 0) {
          await supabase.from("event_logs").insert({
            user_id: userId,
            event_tag: "[EVENT: ADD_DAY]",
            payload: { reason: reasonText, penalty: 1 },
          });
        }
      }

      return NextResponse.json({
        type: "penalty",
        events: penaltyToAdd > 0 ? ["[EVENT: ADD_DAY]"] : [],
        classification: "invalid",
        penaltyAdded: penaltyToAdd,
        penaltiesThisWeek: newPenaltiesThisWeek,
        totalExtraDays: newTotalExtraDays,
        warningText: "⚠️ Warning: At this pace you will not reach your goal on time. You're moving too slow. Push harder!",
        quote: quoteData.quote,
        quoteIndex: quoteData.index,
        weeklyCapReached: !canAddPenalty,
        capNotice: !canAddPenalty ? "Weekly penalty limit (2 days) reached. Roadmap review recommended." : null,
      });
    }

    // UNCLEAR REASON
    return NextResponse.json({
      type: "unclear",
      events: [],
      classification: "unclear",
      followUpQuestion: "Was this incomplete due to an unexpected external blocker, or did time get diverted?",
    });
  } catch (error: any) {
    console.error("[Checkin API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

