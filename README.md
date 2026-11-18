# PathPilot

AI Career Coach and Accountability Partner with strict daily discipline, personalized phased roadmaps, database-backed 24-hour timers, and email reminders.

---

## Architecture Overview

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15 (App Router) + Tailwind CSS** | Unified application with pages, layout, and API route handlers. Tailwind tokens configured with zero purple gradients, sharp rectangular radii, and high-contrast typography. |
| **UI Components** | **shadcn/ui (Restyled)** | Accessible base components customized with sharp 4px radii (`rounded-[4px]`), solid borders, and zero pill-shaped buttons. |
| **AI Coach** | **Claude API (Anthropic SDK)** | Powers PathPilot using the exact accountability prompt, event tag emission, task simplification, and excuse classification. |
| **Database & Auth** | **Supabase (PostgreSQL + RLS)** | Stores user profiles, roadmaps, roadmap phases, daily tasks, checkin audit records, event logs, and email authentication. |
| **24-Hour Timer** | **Database `timer_ends_at` + Vercel Cron** | Stores the absolute expiration timestamp in the database (`timer_ends_at`). Resilient to browser closures, device switches, and tab reloads. |
| **Sign-in** | **Google via Supabase Auth** | Required before the roadmap is generated (no guest mode). The wizard answers are kept locally during the Google redirect and setup finishes automatically on return. |
| **Email Reminders** | **Resend** | Cron job (`/api/cron/check-timers`) sends a "timer ending soon" email `REMINDER_MINUTES_BEFORE` minutes (default 60) before the window closes, and a "timer ended, report back" email if the user never checked in. |
| **Applause Feedback**| **Browser Audio API** | Synthesizes realistic multi-person crowd applause when `[EVENT: PLAY_CLAP_AUDIO]` triggers, without requiring external MP3 downloads. |

---

## Design System Rules

This application follows strict editorial and engineering design standards:
- **Zero purple gradients**: Solid slate/zinc monochrome backgrounds with emerald (`#10b981`), amber (`#f59e0b`), and crimson (`#ef4444`) functional accents.
- **Zero pill-shaped buttons**: All buttons and chips use sharp 4px or 2px micro-radii with visible borders.
- **Zero fake reviews or testimonials**: No fictional social proof quotes or fabricated five-star ratings.
- **Zero fake metrics**: Every progress bar, streak counter, and percentage directly reflects real task completion.
- **Zero em dashes**: No `—` punctuation used anywhere across copy, templates, or AI prompts.
- **Zero vague hero text**: Direct, functional labels ("PathPilot Career Roadmap & Discipline").
- **Zero emoji icons in UI navigation**: Clean inline SVG icons for checkmarks, clocks, terminals, warnings, and audio controls.
- **Zero crazy scroll animations**: Fast, snappy transitions designed for focus and productivity.
- **Zero AI slop photos or copy**: Direct, human, concise mentor feedback.

---

## Getting Started

### 1. Instant Standalone Preview (Zero Install)
You can open `index.html` directly in any web browser or serve it locally:
```bash
# Using Python
python -m http.server 3000

# Or using Node
npx serve .
```
Navigate to `http://localhost:3000` to interact with the full PathPilot experience, onboarding flow, roadmap generator, live 24h timer, Web Audio applause synthesizer, and event bus drawer immediately.

---

### 2. Full-Stack Next.js Application Setup

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` and provide your credentials:
```bash
cp .env.example .env.local
```

Key variables:
- `ANTHROPIC_API_KEY`: Your Anthropic API key (e.g. `sk-ant-...`)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for cron check route)
- `RESEND_API_KEY`: Your Resend API key (e.g. `re_...`)
- `RESEND_FROM_EMAIL`: Sender address (e.g. `PathPilot <coach@yourdomain.com>`)
- `CRON_SECRET`: Secret token for securing `/api/cron/check-timers`

- `REMINDER_MINUTES_BEFORE`: Minutes before the timer ends to send the "ending soon" email (default `60`)

#### Step 3: Enable Google Sign-in
1. **Google Cloud Console** -> APIs & Services -> Credentials -> **Create OAuth client ID** (type: Web application).
   - Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
2. **Supabase Dashboard** -> Authentication -> **Sign In / Providers** -> **Google**: enable it and paste the Client ID and Client Secret.
3. **Supabase Dashboard** -> Authentication -> **URL Configuration**:
   - Site URL: your production URL (e.g. `https://your-app.vercel.app`)
   - Redirect URLs: add `http://localhost:3000/**` and `https://your-app.vercel.app/**`

#### Step 4: Run Database Migrations in Supabase
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `supabase/schema.sql`.
3. Click **Run**. This creates:
   - `profiles` table with `timer_ends_at`, `timer_active`, `streak`, `penalties_this_week`
   - `roadmaps` & `roadmap_phases`
   - `daily_tasks` with status and time estimates
   - `checkin_records` for daily audit logs
   - `event_logs` for tracking system events
   - Row Level Security (RLS) policies and user creation triggers

#### Step 5: Run the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

#### Email Reminder Notes
- Until your own domain is verified in Resend, `onboarding@resend.dev` can only deliver to the email address of your Resend account. Verify a domain and set `RESEND_FROM_EMAIL` to send to real users.
- `vercel.json` runs the cron every 10 minutes. **Vercel Hobby plans only allow cron jobs once per day**, which is too slow for "ending soon" emails. Either use a Pro plan, or call the endpoint every 5-10 minutes from an external scheduler (e.g. cron-job.org, GitHub Actions, or Supabase `pg_cron` + `pg_net`):
  ```
  GET https://your-app.vercel.app/api/cron/check-timers
  Authorization: Bearer <CRON_SECRET>
  ```
- The standalone `index.html` preview has no backend, so it has no sign-in or email reminders.

---

## System Events Specification

PathPilot outputs system event tags on their own line. The application frontend and background listeners capture these hooks:

| Event Tag | Trigger Condition | Application Action |
| :--- | :--- | :--- |
| `[EVENT: START_TIMER_24H]` | User confirms: *"No, I understand all tasks"* | Sets `timer_ends_at = NOW() + 24 hours` in database, starts live countdown clock, logs event. |
| `[EVENT: PLAY_CLAP_AUDIO]` | All scheduled daily tasks are marked completed | Invokes `audioService.playClapAudio()` to synthesize multi-person crowd applause via Web Audio API. |
| `[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]` | All scheduled daily tasks completed | Renders celebration modal with streak +1, roadmap % progress, and unlocks the next day. |
| `[EVENT: RESCHEDULE_TASKS]` | Incomplete tasks with a **VALID** reason (too hard, illness, outage, work emergency) | Simplifies the task, breaks it into 2-3 smaller subtasks, updates upcoming schedule with zero penalty. |
| `[EVENT: ADD_DAY]` | Incomplete tasks with an **INVALID** reason (procrastination, social media, forgot, didn't feel like it) | Adds 1 extra day to the roadmap (capped at 2 penalties per week), displays firm warning and rotated quote. |

---

## Accountability Rules

1. **Tone**: Warm, direct mentor. Firm on actions, never insulting the person.
2. **Mandatory Understanding Check**: Every day ends with *"Is there any task you didn't understand?"*. The 24-hour countdown only starts once the user confirms readiness.
3. **Firm Warning Format on Invalid Excuses**:
   ```
   ⚠️ Warning: At this pace you will not reach your goal on time. You're moving too slow. Push harder!
   ```
   Directly followed by a motivational or humorous quote (rotated so no quote is repeated twice in a row).
4. **Penalty Cap**: Maximum 2 penalty days per 7-day period. Beyond that, PathPilot suggests a roadmap pace review instead of penalizing further.
5. **Burnout Protection**: If the user indicates extreme stress or exhaustion, PathPilot offers a scheduled rest day with zero penalty.
6. **7-Day Review**: Every 7 days, a weekly accountability summary card displays task completion rate, streak, penalties, and focus recommendations.

