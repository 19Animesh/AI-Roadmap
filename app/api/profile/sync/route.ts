import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getUserFromRequest } from "@/lib/supabase/server";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];

// Saves the onboarding answers and progress to the signed-in user's profile,
// so reminder emails know their goal and current day.
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const b = await req.json().catch(() => ({}));
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
    const num = (v: unknown, min: number, max: number) =>
      typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : undefined;

    const update: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      updated_at: new Date().toISOString(),
    };
    const fields: Record<string, unknown> = {
      target_role: str(b.targetRole, 120),
      background: str(b.background, 2000),
      skill_level: SKILL_LEVELS.includes(b.skillLevel) ? b.skillLevel : undefined,
      hours_per_day: num(b.hoursPerDay, 0.5, 16),
      target_timeline_days: num(b.targetDays, 1, 1000),
      learning_style: str(b.learningStyle, 60),
      current_day: num(b.currentDay, 1, 10000),
      streak: num(b.streak, 0, 10000),
    };
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) update[k] = v;

    const supabase = createServerClient();
    const { error } = await supabase.from("profiles").upsert(update, { onConflict: "id" });
    if (error) {
      console.error("[Profile Sync DB Error]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Profile Sync Error]", error);
    return NextResponse.json({ error: error.message || "Failed to sync profile" }, { status: 500 });
  }
}
