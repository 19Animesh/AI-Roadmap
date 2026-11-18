import { NextRequest, NextResponse } from "next/server";
import { askPathPilot } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages payload" },
        { status: 400 }
      );
    }

    const { reply, events } = await askPathPilot(messages);

    return NextResponse.json({
      reply,
      events,
    });
  } catch (error: any) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to contact PathPilot" },
      { status: 500 }
    );
  }
}

