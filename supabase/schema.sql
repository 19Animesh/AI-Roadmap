-- Supabase SQL Schema for PathPilot
-- Stores users, roadmaps, daily tasks, streaks, check-in history, event tags, and database-backed 24-hour timer.

-- 1. PROFILES (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  target_role TEXT,
  background TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  hours_per_day NUMERIC(3,1) DEFAULT 2.0,
  target_timeline_days INT DEFAULT 60,
  learning_style TEXT DEFAULT 'hands-on projects',
  current_day INT DEFAULT 1,
  streak INT DEFAULT 0,
  penalties_this_week INT DEFAULT 0,
  total_extra_days INT DEFAULT 0,
  hard_excuse_count INT DEFAULT 0,
  fast_finish_count INT DEFAULT 0,
  
  -- Database-backed 24-hour timer
  timer_active BOOLEAN DEFAULT false,
  timer_started_at TIMESTAMPTZ,
  timer_ends_at TIMESTAMPTZ,
  warning_sent BOOLEAN DEFAULT false,   -- "timer ending soon" email sent
  reminder_sent BOOLEAN DEFAULT false,  -- "timer ended" email sent
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROADMAPS
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  total_days INT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROADMAP PHASES
CREATE TABLE IF NOT EXISTS public.roadmap_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  phase_order INT NOT NULL,
  name TEXT NOT NULL,
  estimated_days INT NOT NULL,
  deliverable TEXT NOT NULL,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DAILY TASKS
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.roadmap_phases(id) ON DELETE SET NULL,
  day_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_minutes INT NOT NULL,
  free_resource TEXT NOT NULL,
  hint TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'rescheduled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHECKIN RECORDS (Audit log of all daily outcomes)
CREATE TABLE IF NOT EXISTS public.checkin_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('all_completed', 'has_missed', 'rest_day')),
  missed_task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
  user_reason TEXT,
  reason_type TEXT CHECK (reason_type IN ('valid', 'invalid', 'unclear', 'burnout')),
  penalty_days_added INT DEFAULT 0,
  quote_shown TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENT LOGS (Records event tags emitted by PathPilot)
CREATE TABLE IF NOT EXISTS public.event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_tag TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Roadmaps Policies
CREATE POLICY "Users can manage own roadmaps" ON public.roadmaps
  FOR ALL USING (auth.uid() = user_id);

-- Roadmap Phases Policies
CREATE POLICY "Users can view phases" ON public.roadmap_phases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.roadmaps WHERE roadmaps.id = roadmap_phases.roadmap_id AND roadmaps.user_id = auth.uid())
  );

-- Daily Tasks Policies
CREATE POLICY "Users can manage own daily tasks" ON public.daily_tasks
  FOR ALL USING (auth.uid() = user_id);

-- Checkins Policies
CREATE POLICY "Users can manage own checkin records" ON public.checkin_records
  FOR ALL USING (auth.uid() = user_id);

-- Event Logs Policies
CREATE POLICY "Users can manage own event logs" ON public.event_logs
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Upgrade for databases created before the "ending soon" email existed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS warning_sent BOOLEAN DEFAULT false;

-- Index for scheduled timer checks
CREATE INDEX IF NOT EXISTS idx_profiles_timer_ends_at
  ON public.profiles(timer_ends_at)
  WHERE timer_active = true;

