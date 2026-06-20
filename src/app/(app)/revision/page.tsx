"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Brain,
  CheckCircle2,
  Loader,
  PartyPopper,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";

type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

interface DueItem {
  id: string;
  topicId: string;
  reviewDate: string;
  intervalDays: number;
  easeFactor: number;
  repetition: number;
  topic: {
    id: string;
    title: string;
    difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  };
}

const difficultyStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
};

const ratingOptions: {
  value: Rating;
  label: string;
  hint: string;
  className: string;
}[] = [
  {
    value: "AGAIN",
    label: "Again",
    hint: "Didn't recall it",
    className:
      "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
  {
    value: "HARD",
    label: "Hard",
    hint: "Recalled with effort",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
  },
  {
    value: "GOOD",
    label: "Good",
    hint: "Recalled correctly",
    className:
      "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    value: "EASY",
    label: "Easy",
    hint: "Recalled instantly",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
  },
];

const RevisionPage = () => {
  const [queue, setQueue] = useState<DueItem[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastInterval, setLastInterval] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDue() {
      try {
        const res = await fetch("/api/revision/due");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load revision queue.");
          return;
        }
        setQueue(data.due);
        setTotalDue(data.due.length);
      } catch {
        setError("Failed to load revision queue.");
      } finally {
        setLoading(false);
      }
    }
    fetchDue();
  }, []);

  async function submitRating(topicId: string, rating: Rating) {
    setSubmitting(true);
    setError("");
    setLastInterval(null);

    try {
      const res = await fetch(`/api/revision/${topicId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to submit review.");
        return;
      }

      setLastInterval(data.schedule.intervalDays);
      setQueue((prev) => prev.filter((item) => item.topicId !== topicId));
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const current = queue[0];
  const reviewedCount = totalDue - queue.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Revision
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Spaced repetition review — rate how well you recalled each topic.
        </p>
      </div>

      {error && (
        <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      {totalDue > 0 && (
        <div className="rounded-xl border-2 border-border bg-card p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Reviewed</span>
            <span className="font-semibold text-primary">
              {reviewedCount} / {totalDue}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(reviewedCount / totalDue) * 100}%` }}
            />
          </div>
        </div>
      )}

      {!current ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            {totalDue > 0 ? (
              <PartyPopper className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <h3 className="font-display font-semibold">
            {totalDue > 0 ? "All caught up!" : "Nothing due for revision"}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {totalDue > 0
              ? "You've reviewed every topic that was due. Check back later for the next round."
              : "Topics you've completed will show up here when they're due for spaced-repetition review."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-border bg-card p-6">
          {lastInterval !== null && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-medium text-primary">
              <RotateCcw className="h-3.5 w-3.5" />
              Next review in {lastInterval} day{lastInterval === 1 ? "" : "s"}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                difficultyStyles[current.topic.difficultyLevel] ??
                  "border-border bg-muted text-foreground",
              )}
            >
              {current.topic.difficultyLevel.toLowerCase()}
            </span>
            <span className="text-xs text-muted-foreground">
              Repetition #{current.repetition}
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Brain className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-semibold">
              {current.topic.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              How well did you recall this topic?
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {ratingOptions.map(({ value, label, hint, className }) => (
              <button
                key={value}
                disabled={submitting}
                onClick={() => submitRating(current.topicId, value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                  className,
                )}
              >
                {label}
                <span className="text-xs font-normal opacity-80">{hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {queue.length > 1 && (
        <div className="rounded-xl border-2 border-border bg-card p-5">
          <h3 className="font-display text-sm font-semibold text-muted-foreground">
            Up next
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            {queue.slice(1, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm"
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span className="truncate text-foreground/90">
                  {item.topic.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => window.location.reload()}
        className="self-start"
      >
        Refresh queue
      </Button>
    </div>
  );
};

export default RevisionPage;
