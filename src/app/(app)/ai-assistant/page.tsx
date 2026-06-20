"use client";

import { cn } from "@/lib/utils";
import { Bot, Loader, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

const SUGGESTIONS = [
  "What should I focus on next in my learning path?",
  "Explain closures in JavaScript with an example.",
  "What's the difference between REST and GraphQL?",
  "How do I debug a memory leak?",
];

const AiAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/assistant/chat");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load conversation.");
          return;
        }
        setMessages(data.messages);
      } catch {
        setError("Failed to load conversation.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError("");
    setInput("");
    setSending(true);

    const optimisticUserMessage: Message = {
      id: `optimistic-${Date.now()}`,
      role: "USER",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send message.");
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticUserMessage.id),
        );
        return;
      }

      setMessages((prev) => [...prev, data.message]);
    } catch {
      setError("Failed to send message.");
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticUserMessage.id),
      );
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          AI Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions about your learning path, get explanations, or work
          through a problem together.
        </p>
      </div>

      <div className="flex h-[70vh] flex-col rounded-xl border-2 border-border bg-card">
        {/* messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader size={28} className="animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display font-semibold">
                Ask me anything
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                I can help explain concepts, debug code, or guide you through
                your learning path.
              </p>
              <div className="mt-5 grid w-full max-w-md gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-lg border border-border bg-surface/40 px-3.5 py-2.5 text-left text-sm text-foreground/90 transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "USER" && "flex-row-reverse",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.role === "USER"
                        ? "bg-primary/15 text-primary"
                        : "bg-surface text-foreground/70 border border-border",
                    )}
                  >
                    {message.role === "USER" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "USER"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface/40 text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/70">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-border bg-surface/40 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <p className="mx-6 mb-2 text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        {/* input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-border p-4"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-lg border border-border bg-surface/40 px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantPage;
