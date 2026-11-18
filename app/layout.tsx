import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathPilot - AI Career Coach & Daily Accountability Partner",
  description:
    "Personalized career roadmaps with daily task assignments, 24-hour accountability tracking, and firm discipline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30">
        {children}
      </body>
    </html>
  );
}

