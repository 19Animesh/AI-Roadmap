"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSend, IconTerminal } from "@/components/icons";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface CoachChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function CoachChat({ messages, onSendMessage, isLoading }: CoachChatProps) {
  const [inputText, setInputText] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText("");
    onSendMessage(msg);
  };

  return (
    <Card className="flex flex-col h-[520px]">
      <CardHeader>
        <CardTitle>
          <IconTerminal /> PathPilot Direct Dialogue
        </CardTitle>
        <span className="text-[11px] font-mono text-muted-foreground">
          Powered by Claude API
        </span>
      </CardHeader>

      {/* Message Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 font-mono">
              <span>{m.role === "user" ? "YOU" : "PATHPILOT"}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-[4px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-foreground text-background font-medium"
                  : "bg-surface-subtle border border-border text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
            <span className="animate-pulse font-mono">PathPilot is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface-subtle flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask coach for advice, report completed work, or discuss obstacles..."
          disabled={isLoading}
        />
        <Button type="submit" variant="primary" disabled={isLoading || !inputText.trim()}>
          <IconSend /> Send
        </Button>
      </form>
    </Card>
  );
}

