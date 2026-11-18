"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { IconTerminal } from "@/components/icons";
import { useSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { session, ready } = useSession();

  // Already signed in (or just returned from Google): go to the app
  React.useEffect(() => {
    if (ready && session) router.replace("/");
  }, [ready, session, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-wider text-foreground">
          <IconTerminal />
          <span className="font-bold">PathPilot</span>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sign in to your account</CardTitle>
              <CardDescription>
                Keep your roadmap, daily tasks, and 24-hour timer in sync, and get an email before your timer runs out.
              </CardDescription>
            </div>
          </CardHeader>

          <GoogleSignInButton returnPath="/login" />
        </Card>
      </div>
    </div>
  );
}
