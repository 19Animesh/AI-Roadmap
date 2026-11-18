import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getUserFromRequest } from "@/lib/supabase/server";

// Starts the user's 24-hour window and arms the "ending soon" and "ended" emails.
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const currentDay = Number.isInteger(body.currentDay) && body.currentDay > 0 ? body.currentDay : 1;
    const targetRole = typeof body.targetRole === "string" ? body.targetRole.slice(0, 120) : null;

    const supabase = createServerClient();

    // Don't restart a window that is still running
    const { data: existing } = await supabase
      .from("profiles")
      .select("timer_active, timer_ends_at")
      .eq("id", user.id)
      .maybeSingle();

    if (
      existing?.timer_active &&
      existing.timer_ends_at &&
      new Date(existing.timer_ends_at).getTime() > Date.now()
    ) {
      return NextResponse.json({
        success: true,
        already_running: true,
        timer_active: true,
        timer_ends_at: existing.timer_ends_at,
      });
    }

    const now = new Date();
    const fullWindowMs = 24 * 60 * 60 * 1000;
    let endsAt = new Date(now.getTime() + fullWindowMs);

    // Accept the client's end time (keeps the on-screen clock and the emails
    // in sync, e.g. when a running local timer is synced after sign-in), but
    // only if it lies within the next 24 hours.
    if (typeof body.endsAt === "string") {
      const clientEnds = new Date(body.endsAt).getTime();
      if (Number.isFinite(clientEnds) && clientEnds > now.getTime() && clientEnds <= now.getTime() + fullWindowMs + 60_000) {
        endsAt = new Date(clientEnds);
      }
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        current_day: currentDay,
        ...(targetRole ? { target_role: targetRole } : {}),
        timer_active: true,
        timer_started_at: now.toISOString(),
        timer_ends_at: endsAt.toISOString(),
        warning_sent: false,
        reminder_sent: false,
        updated_at: now.toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("[Timer Start DB Error]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("event_logs").insert({
      user_id: user.id,
      event_tag: "[EVENT: START_TIMER_24H]",
      payload: { day: currentDay, started_at: now.toISOString(), ends_at: endsAt.toISOString() },
    });

    return NextResponse.json({
      success: true,
      timer_active: true,
      timer_started_at: now.toISOString(),
      timer_ends_at: endsAt.toISOString(),
    });
  } catch (error: any) {
    console.error("[Timer Start Error]", error);
    return NextResponse.json({ error: error.message || "Failed to start 24h timer" }, { status: 500 });
  }
}
