import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getUserFromRequest } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("timer_active, timer_started_at, timer_ends_at, reminder_sent")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile || !profile.timer_ends_at) {
      return NextResponse.json({
        timer_active: false,
        remaining_seconds: 0,
        is_expired: false,
      });
    }

    const diffSeconds = Math.floor((new Date(profile.timer_ends_at).getTime() - Date.now()) / 1000);
    const isExpired = diffSeconds <= 0;

    return NextResponse.json({
      timer_active: profile.timer_active && !isExpired,
      timer_ends_at: profile.timer_ends_at,
      remaining_seconds: Math.max(0, diffSeconds),
      is_expired: isExpired,
    });
  } catch (error: any) {
    console.error("[Timer Status Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
