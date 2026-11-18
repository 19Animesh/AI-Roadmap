"use client";

import * as React from "react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { IconCheck } from "@/components/icons";

// Blocking sign-in step shown before the roadmap is generated (and for any
// existing local data without an account). It cannot be dismissed: there is
// no guest mode.
export function LoginGateModal({ isOpen, roleLabel }: { isOpen: boolean; roleLabel?: string }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md bg-surface border border-border rounded-[4px] p-6 shadow-2xl space-y-5">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Last step
          </div>
          <h2 id="login-gate-title" className="text-lg font-bold text-foreground">
            Sign in to save your roadmap
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {roleLabel
              ? `Your ${roleLabel} roadmap is ready. Sign in so it is tied to your account.`
              : "Sign in so your roadmap and progress are tied to your account."}
          </p>
        </div>

        <ul className="space-y-2 text-xs text-foreground">
          {[
            "Email reminder before your 24-hour timer runs out",
            "Your goal, streak, and day count saved to your account",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="text-success mt-0.5">
                <IconCheck />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <GoogleSignInButton returnPath="/" />

        <p className="text-[11px] text-muted-foreground">
          Your answers are kept on this device while you sign in.
        </p>
      </div>
    </div>
  );
}
