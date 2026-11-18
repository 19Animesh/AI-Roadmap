import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOTIVATIONAL_AND_FUNNY_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "The best time to plant a tree was 20 years ago. The second best time is right now.",
  "If you want to be proud of yourself, do things you can be proud of.",
  "Procrastination makes easy things hard and hard things harder.",
  "Action cures fear. Inaction creates terror.",
  "Future you is either going to thank you or curse you. Choose right now.",
  "Even a slow turtle beats a hare taking a nap on Instagram.",
  "It is not about having time. It is about making time.",
  "Consistency is not doing 10 hours once. It is doing 1 hour 10 times.",
  "Your dream career will not build itself while you browse your phone.",
  "The secret to getting ahead is simply getting started."
];

export function getNextQuote(lastIndex: number = -1): { quote: string; index: number } {
  let nextIdx = Math.floor(Math.random() * MOTIVATIONAL_AND_FUNNY_QUOTES.length);
  if (nextIdx === lastIndex) {
    nextIdx = (nextIdx + 1) % MOTIVATIONAL_AND_FUNNY_QUOTES.length;
  }
  return {
    quote: MOTIVATIONAL_AND_FUNNY_QUOTES[nextIdx],
    index: nextIdx,
  };
}

export const VALID_EXCUSE_KEYWORDS = [
  "too hard", "hard", "complex", "difficult", "struggled", "didn't understand",
  "unclear", "too big", "overwhelmed", "stuck", "bug", "error",
  "sick", "illness", "fever", "headache", "doctor", "hospital", "unwell",
  "family", "emergency", "personal issue", "funeral",
  "power", "internet", "wifi", "blackout", "electricity", "outage",
  "exam", "finals", "overtime", "urgent meeting", "work shift", "boss called",
  "urgent job", "workload"
];

export const INVALID_EXCUSE_KEYWORDS = [
  "lazy", "laziness", "procrastinated", "procrastination", "distracted", "distraction",
  "social media", "instagram", "tiktok", "youtube", "twitter", "x", "reddit",
  "gaming", "game", "played", "playstation", "xbox", "steam",
  "didn't feel like it", "not in mood", "mood", "forgot", "slept",
  "netflix", "movie", "show", "binge", "tired from doing nothing", "bored"
];

export function classifyExcuse(reasonText: string): {
  type: "valid" | "invalid" | "unclear";
  keyword?: string;
} {
  const lower = (reasonText || "").toLowerCase().trim();

  for (const kw of VALID_EXCUSE_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: "valid", keyword: kw };
    }
  }

  for (const kw of INVALID_EXCUSE_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: "invalid", keyword: kw };
    }
  }

  if (lower.length < 12 || lower.includes("idk") || lower.includes("nothing")) {
    return { type: "unclear" };
  }

  if (lower.includes("health") || lower.includes("emergency") || lower.includes("crash")) {
    return { type: "valid", keyword: "emergency" };
  }

  return { type: "unclear" };
}

export function formatSecondsToDigital(seconds: number): string {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

