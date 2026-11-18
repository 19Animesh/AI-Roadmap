"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowRight, IconCheck } from "@/components/icons";

export interface OnboardingData {
  targetRole: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  background: string;
  hoursPerDay: number;
  targetDays: number;
  learningStyle: string;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);

  const [targetRole, setTargetRole] = React.useState("Frontend Developer");
  const [skillLevel, setSkillLevel] = React.useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [background, setBackground] = React.useState("");
  const [hoursPerDay, setHoursPerDay] = React.useState(2);
  const [targetDays, setTargetDays] = React.useState(60);
  const [learningStyle, setLearningStyle] = React.useState("hands-on projects");

  const quickRoles = [
    "Frontend Developer",
    "Full-Stack Developer",
    "Data Analyst",
    "Machine Learning Engineer",
    "Backend Engineer",
    "DevOps Engineer",
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as any);
    } else {
      onComplete({
        targetRole,
        skillLevel,
        background: background.trim() || "No previous technical background specified.",
        hoursPerDay,
        targetDays,
        learningStyle,
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-[4px] font-mono text-xs">
        <span className="text-muted-foreground">ONBOARDING SEQUENCE</span>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((num) => (
            <span
              key={num}
              className={`w-6 h-6 flex items-center justify-center rounded-[2px] border ${
                step === num
                  ? "bg-foreground text-background border-foreground font-bold"
                  : step > num
                  ? "bg-success text-white border-success"
                  : "bg-surface-subtle border-border text-muted-foreground"
              }`}
            >
              {step > num ? "✓" : num}
            </span>
          ))}
        </div>
      </div>

      {/* STEP 1: Target Role */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Step 1 of 4: Target Career Goal</CardTitle>
              <CardDescription>
                Define the specific role or technical position you are committing to achieve.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2 font-mono">
                Quick Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`p-2.5 text-xs text-left border rounded-[4px] transition-colors ${
                      targetRole === role
                        ? "bg-surface-elevated border-foreground text-foreground font-semibold"
                        : "bg-surface-subtle border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1 font-mono">
                Or Enter Custom Role Title
              </label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Distributed Systems Engineer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleNext} disabled={!targetRole.trim()}>
                Continue to Background <IconArrowRight />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Current Skill Level & Background */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Step 2 of 4: Skill Level and Background</CardTitle>
              <CardDescription>
                Be realistic with your starting baseline so the roadmap builds the right foundation.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2 font-mono">
                Current Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSkillLevel(lvl)}
                    className={`p-2.5 text-xs text-center uppercase font-mono border rounded-[4px] transition-colors ${
                      skillLevel === lvl
                        ? "bg-surface-elevated border-foreground text-foreground font-bold"
                        : "bg-surface-subtle border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1 font-mono">
                Current Background & Experience
              </label>
              <Textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="e.g. Self-taught basics in Python, non-technical university degree, looking to transition into engineering full-time."
              />
            </div>

            <div className="pt-2 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue to Time Commitments <IconArrowRight />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Hours & Target Timeline */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Step 3 of 4: Time Commitment & Deadline</CardTitle>
              <CardDescription>
                PathPilot creates daily tasks sized strictly to fit your daily schedule.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground font-mono">
                  Hours Available Per Day
                </label>
                <span className="font-mono text-xs font-bold text-foreground">
                  {hoursPerDay} {hoursPerDay === 1 ? "hour" : "hours"} / day
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
                className="w-full accent-foreground cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                <span>1h (Consistent)</span>
                <span>4h (Intensive)</span>
                <span>8h (Full-time)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2 font-mono">
                Target Timeline
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setTargetDays(days)}
                    className={`p-2.5 text-xs text-center font-mono border rounded-[4px] transition-colors ${
                      targetDays === days
                        ? "bg-surface-elevated border-foreground text-foreground font-bold"
                        : "bg-surface-subtle border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Continue to Learning Style <IconArrowRight />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Learning Style */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Step 4 of 4: Preferred Learning Style</CardTitle>
              <CardDescription>
                Task hints and recommended resources will prioritize this format.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {[
                {
                  id: "hands-on projects",
                  title: "Hands-on Projects & Building",
                  desc: "Learn by implementing real code, debugging, and building practical capstones.",
                },
                {
                  id: "reading documentation",
                  title: "Reading Documentation & Technical Specs",
                  desc: "Deep dive into official guides, specs, and architectural writeups.",
                },
                {
                  id: "structured videos",
                  title: "Curated Videos & Walkthroughs",
                  desc: "Visual demonstrations followed immediately by active practice.",
                },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setLearningStyle(style.id)}
                  className={`w-full p-3 text-left border rounded-[4px] transition-colors block ${
                    learningStyle === style.id
                      ? "bg-surface-elevated border-foreground text-foreground"
                      : "bg-surface-subtle border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-semibold text-xs text-foreground mb-0.5">
                    {style.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {style.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-3 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleNext} variant="primary">
                <IconCheck /> Generate My Roadmap
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

