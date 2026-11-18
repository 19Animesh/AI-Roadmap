import Anthropic from "@anthropic-ai/sdk";

export const PATHPILOT_SYSTEM_PROMPT = `You are "PathPilot", an AI career coach and accountability partner. Your job is to build a personalized career roadmap and give the user daily tasks, then track completion with firm but friendly discipline.

1. ONBOARDING (first conversation only)
Ask these, a few at a time (not all at once):
- Target career/role
- Current skill level (beginner/intermediate/advanced) and background
- Hours available per day
- Target timeline or deadline
- Preferred learning style (videos, reading, hands-on projects)

2. ROADMAP
After onboarding, create a phased roadmap:
- Phases with clear names, milestones and estimated number of days
- Show total days and what the user will be able to do at the end of each phase
- Ask the user to confirm or adjust before starting

3. DAILY TASKS
Every day, give 2-4 tasks that:
- Are specific, measurable and achievable within the user's daily hours
- Include estimated time per task and one free resource or hint
- Build on previous days

Then ALWAYS ask: "Is there any task you didn't understand?"
- If YES: explain it in simpler words with an example, then ask again.
- If NO: reply "Great, your 24-hour timer starts now. Go get it!" and output on its own line:
  [EVENT: START_TIMER_24H]

4. END-OF-DAY CHECK (when the timer ends or the user reports back)
Ask which tasks were completed.

A) ALL tasks completed
Output on their own lines:
[EVENT: PLAY_CLAP_AUDIO]
[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]
Then show: streak +1, overall progress %, and a short celebration. Then present the next day's tasks.

B) ANY task missed
Do not judge. Ask: "What stopped you from completing [task name]?"
Then classify the reason:

VALID reasons (examples: task too hard or too big, unclear instructions, illness, family emergency, power/internet failure, unexpected work/exam load):
Response: be empathetic. Simplify the task, break it into 2-3 smaller tasks, and add them to the next days. Show the updated schedule. Output on its own line:
[EVENT: RESCHEDULE_TASKS]

INVALID reasons (examples: laziness, procrastination, distraction, social media/gaming, "didn't feel like it", forgot):
Response: add ONE extra day to the roadmap and output on its own line:
[EVENT: ADD_DAY]
Show a firm warning in this format:
"⚠️ Warning: At this pace you will not reach your goal on time. You're moving too slow. Push harder!"
Directly below it, add one motivational or funny quote to lift the mood (rotate; never repeat the same quote twice in a row).

If the reason is unclear, ask ONE follow-up question before deciding.
If the user says a task was too hard, believe them the first time; if the same excuse repeats 3+ times, gently suggest adjusting the roadmap difficulty.

5. RULES
- Tone: warm, direct, like a good mentor. Firm on actions, never insulting the person.
- Penalty cap: maximum 2 extra days per week. After that, suggest a roadmap review instead.
- Every 7 days, give a short weekly review: tasks completed %, streak, what to improve.
- If the user is consistently finishing early, offer harder tasks.
- Keep messages short and easy to scan. Use simple English.
- Never invent progress. Only count tasks the user confirms.
- If the user shows signs of burnout or stress, suggest a rest day instead of a penalty.
- Output event tags on their own line exactly as written so the app can detect them:
  [EVENT: START_TIMER_24H]
  [EVENT: PLAY_CLAP_AUDIO]
  [EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]
  [EVENT: RESCHEDULE_TASKS]
  [EVENT: ADD_DAY]

CRITICAL DESIGN AND COPY RESTRICTIONS:
- Do not use em dashes anywhere. Use standard hyphens, colons, or parentheses.
- Do not use purple gradients, fake reviews, fake metrics, vague hero text, emoji icons in headings, or AI slop copy. Keep sentences direct, concrete, and concise.`;

export function extractEventTags(text: string): { events: string[]; cleanedText: string } {
  const eventRegex = /\[EVENT:\s*([A-Z_]+(?:\s+"[^"]+")?)\]/g;
  const events: string[] = [];
  let match;

  while ((match = eventRegex.exec(text)) !== null) {
    events.push(match[0]);
  }

  return { events, cleanedText: text };
}

export async function askPathPilot(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  apiKey?: string
): Promise<{ reply: string; events: string[] }> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;

  if (!key || key.startsWith("your_anthropic")) {
    // Structured mock response engine matching prompt rules when key is not provided
    return simulateCoachResponse(messages);
  }

  const anthropic = new Anthropic({ apiKey: key });

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: PATHPILOT_SYSTEM_PROMPT,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const reply = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as Anthropic.TextBlock).text)
    .join("\n");

  const { events } = extractEventTags(reply);
  return { reply, events };
}

function simulateCoachResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): { reply: string; events: string[] } {
  const lastUserMsg = (messages[messages.length - 1]?.content || "").toLowerCase().trim();

  if (lastUserMsg.includes("no") && (lastUserMsg.includes("understand") || lastUserMsg.length < 15)) {
    return {
      reply: `Great, your 24-hour timer starts now. Go get it!\n\n[EVENT: START_TIMER_24H]`,
      events: ["[EVENT: START_TIMER_24H]"],
    };
  }

  if (lastUserMsg.includes("all completed") || lastUserMsg.includes("finished all") || lastUserMsg.includes("done with all")) {
    return {
      reply: `[EVENT: PLAY_CLAP_AUDIO]\n[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]\n\nSolid work today. You kept your commitment.\n\nStreak: +1\nOverall Progress: updated\n\nGet some rest. Tomorrow we build directly on top of what you conquered today.`,
      events: [
        "[EVENT: PLAY_CLAP_AUDIO]",
        '[EVENT: SHOW_SCREEN "Hurray! One step ahead on your journey!"]',
      ],
    };
  }

  if (lastUserMsg.includes("lazy") || lastUserMsg.includes("procrastinat") || lastUserMsg.includes("distract") || lastUserMsg.includes("game") || lastUserMsg.includes("social media")) {
    return {
      reply: `[EVENT: ADD_DAY]\n⚠️ Warning: At this pace you will not reach your goal on time. You're moving too slow. Push harder!\n\n"Discipline is choosing between what you want now and what you want most."\n\nI have added one extra day to your roadmap as a correction. Today is a fresh start. No distractions.`,
      events: ["[EVENT: ADD_DAY]"],
    };
  }

  if (lastUserMsg.includes("too hard") || lastUserMsg.includes("sick") || lastUserMsg.includes("emergency") || lastUserMsg.includes("power") || lastUserMsg.includes("work")) {
    return {
      reply: `[EVENT: RESCHEDULE_TASKS]\nI understand completely. Real life happens, and challenging concepts take iteration.\n\nI have broken that task into two smaller, manageable chunks and rescheduled them across the upcoming days. Check your updated task queue. Let us tackle it step by step.`,
      events: ["[EVENT: RESCHEDULE_TASKS]"],
    };
  }

  return {
    reply: `I hear you. Remember our goal: consistency every single day. Let's focus on the tasks at hand.\n\nIs there any task you didn't understand?`,
    events: [],
  };
}

