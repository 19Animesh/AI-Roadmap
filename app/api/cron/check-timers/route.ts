import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendTimerEndedEmail, sendTimerEndingSoonEmail } from "@/lib/resend";

// Runs on a schedule (see vercel.json). Two passes:
//  1. "Ending soon": timer ends within REMINDER_MINUTES_BEFORE (default 60) -> warning email
//  2. "Ended": timer has run out without a check-in -> report-back email
// Each row is claimed (flag flipped) before sending, so overlapping runs never double-send.

type ProfileRow = {
  id: string;
  email: string;
  target_role: string | null;
  current_day: number | null;
  timer_ends_at: string;
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const urlSecret = new URL(req.url).searchParams.get("key");
      if (urlSecret !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = createServerClient();
    const now = new Date();
    const nowIso = now.toISOString();
    const minutesBefore = Math.max(5, parseInt(process.env.REMINDER_MINUTES_BEFORE || "60", 10) || 60);
    const warnBeforeIso = new Date(now.getTime() + minutesBefore * 60 * 1000).toISOString();

    // PASS 1: ending soon
    const { data: endingSoon, error: soonError } = await supabase
      .from("profiles")
      .update({ warning_sent: true })
      .eq("timer_active", true)
      .eq("warning_sent", false)
      .gt("timer_ends_at", nowIso)
      .lte("timer_ends_at", warnBeforeIso)
      .select("id, email, target_role, current_day, timer_ends_at");

    if (soonError) {
      console.error("[Cron Ending-Soon Query Error]", soonError);
      return NextResponse.json({ error: soonError.message }, { status: 500 });
    }

    const warnings = [];
    for (const p of (endingSoon || []) as ProfileRow[]) {
      const minutesLeft = Math.max(1, Math.round((new Date(p.timer_ends_at).getTime() - now.getTime()) / 60000));
      const result = await sendTimerEndingSoonEmail({
        toEmail: p.email,
        targetRole: p.target_role || "your career goal",
        currentDay: p.current_day || 1,
        minutesLeft,
      });

      if (result.success) {
        await supabase.from("event_logs").insert({
          user_id: p.id,
          event_tag: "[CRON: TIMER_ENDING_SOON_EMAIL_SENT]",
          payload: { timer_ends_at: p.timer_ends_at, minutes_left: minutesLeft },
        });
      } else {
        // Release the claim so the next run retries
        await supabase.from("profiles").update({ warning_sent: false }).eq("id", p.id);
      }
      warnings.push({ id: p.id, sent: result.success });
    }

    // PASS 2: ended
    const { data: expired, error: endedError } = await supabase
      .from("profiles")
      .update({ reminder_sent: true, warning_sent: true })
      .eq("timer_active", true)
      .eq("reminder_sent", false)
      .lte("timer_ends_at", nowIso)
      .select("id, email, target_role, current_day, timer_ends_at");

    if (endedError) {
      console.error("[Cron Ended Query Error]", endedError);
      return NextResponse.json({ error: endedError.message }, { status: 500 });
    }

    const ended = [];
    for (const p of (expired || []) as ProfileRow[]) {
      const result = await sendTimerEndedEmail({
        toEmail: p.email,
        targetRole: p.target_role || "your career goal",
        currentDay: p.current_day || 1,
      });

      if (result.success) {
        await supabase.from("event_logs").insert({
          user_id: p.id,
          event_tag: "[CRON: TIMER_ENDED_EMAIL_SENT]",
          payload: { timer_ends_at: p.timer_ends_at },
        });
      } else {
        await supabase.from("profiles").update({ reminder_sent: false }).eq("id", p.id);
      }
      ended.push({ id: p.id, sent: result.success });
    }

    return NextResponse.json({
      success: true,
      checked_at: nowIso,
      ending_soon_notified: warnings.filter((w) => w.sent).length,
      ended_notified: ended.filter((e) => e.sent).length,
      warnings,
      ended,
    });
  } catch (error: any) {
    console.error("[Cron Execution Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
