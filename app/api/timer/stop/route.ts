import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getUserFromRequest } from "@/lib/supabase/server";

// Turns off timer emails for the current day: the user checked in, took a
// rest day, got tasks rescheduled, or reset their roadmap.
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.slice(0, 60) : "stopped";

    const supabase = createServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({ timer_active: false, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("[Timer Stop DB Error]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("event_logs").insert({
      user_id: user.id,
      event_tag: "[EVENT: TIMER_STOPPED]",
      payload: { reason },
    });

    return NextResponse.json({ success: true, timer_active: false });
  } catch (error: any) {
    console.error("[Timer Stop Error]", error);
    return NextResponse.json({ error: error.message || "Failed to stop timer" }, { status: 500 });
  }
}
