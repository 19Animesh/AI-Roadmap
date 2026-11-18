import { Resend } from "resend";

type EmailResult = { success: boolean; error?: string };

interface TimerEmailParams {
  toEmail: string;
  targetRole: string;
  currentDay: number;
  appUrl?: string;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEmail({
  heading,
  body,
  ctaLabel,
  ctaUrl,
}: {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px;">
      <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.05em; color: #4b5563; text-transform: uppercase; margin-bottom: 12px; font-family: monospace;">
        PATHPILOT ACCOUNTABILITY PARTNER
      </div>
      <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">${heading}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #374151; margin-bottom: 20px;">${body}</p>
      <div style="margin-bottom: 24px;">
        <a href="${ctaUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 20px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 4px;">
          ${ctaLabel}
        </a>
      </div>
      <p style="font-size: 12px; color: #6b7280; margin: 0; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        Firm on actions, friendly on growth. Stay accountable to your future self.
      </p>
    </div>
  `;
}

async function sendEmail(toEmail: string, subject: string, html: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "PathPilot <onboarding@resend.dev>";

  if (!apiKey || apiKey.startsWith("re_your_resend")) {
    console.log(`[Resend Mock] Email would be sent to ${toEmail}: "${subject}"`);
    return { success: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: fromEmail, to: [toEmail], subject, html });
    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[Resend Exception]", err);
    return { success: false, error: err.message };
  }
}

const baseUrlOf = (appUrl?: string) =>
  appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Sent shortly before the 24-hour window closes. */
export async function sendTimerEndingSoonEmail({
  toEmail,
  targetRole,
  currentDay,
  minutesLeft,
  appUrl,
}: TimerEmailParams & { minutesLeft: number }): Promise<EmailResult> {
  const timeLeft =
    minutesLeft >= 60
      ? `${Math.round(minutesLeft / 60)} hour${Math.round(minutesLeft / 60) === 1 ? "" : "s"}`
      : `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`;

  return sendEmail(
    toEmail,
    `PathPilot: about ${timeLeft} left on your Day ${currentDay} timer`,
    renderEmail({
      heading: `About ${timeLeft} left for Day ${currentDay}.`,
      body: `Target Goal: <strong>${escapeHtml(targetRole)}</strong><br/>
        Your 24-hour window is almost over. Finish your remaining tasks and check in before the clock runs out to protect your streak.`,
      ctaLabel: "Open My Tasks",
      ctaUrl: baseUrlOf(appUrl),
    })
  );
}

/** Sent once the 24-hour window has closed without a check-in. */
export async function sendTimerEndedEmail({
  toEmail,
  targetRole,
  currentDay,
  appUrl,
}: TimerEmailParams): Promise<EmailResult> {
  return sendEmail(
    toEmail,
    `PathPilot Alert: Your 24-hour timer ended for Day ${currentDay}`,
    renderEmail({
      heading: `Your 24-hour timer has ended for Day ${currentDay}.`,
      body: `Target Goal: <strong>${escapeHtml(targetRole)}</strong><br/>
        Your daily window has concluded. Time to check in, report which tasks were completed, and protect your streak.`,
      ctaLabel: "Report Completed Tasks Now",
      ctaUrl: `${baseUrlOf(appUrl)}?action=checkin&day=${currentDay}`,
    })
  );
}
