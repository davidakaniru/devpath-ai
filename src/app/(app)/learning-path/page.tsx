"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Loader,
  Lock,
  Sparkles,
  Video,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Resource {
  id: string;
  title: string;
  type: "ARTICLE" | "VIDEO" | "DOCUMENTATION" | "PROJECT";
  url: string;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  sequenceOrder: number;
  resources: Resource[];
  completed: boolean;
  progressPercentage: number;
  locked: boolean;
  isCurrent: boolean;
}

interface LearningPathData {
  id: string;
  title: string;
  overallProgress: number;
  completedCount: number;
  totalCount: number;
  topics: Topic[];
}

const difficultyStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
};

const resourceIcons: Record<Resource["type"], typeof FileText> = {
  ARTICLE: FileText,
  VIDEO: Video,
  DOCUMENTATION: BookOpen,
  PROJECT: Wrench,
};

const LearningPathPage = () => {
  const [path, setPath] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPath() {
      try {
        const res = await fetch("/api/learning-path");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load your learning path.");
          return;
        }
        setPath(data.path);
      } catch {
        setError("Failed to load your learning path.");
      } finally {
        setLoading(false);
      }
    }
    fetchPath();
  }, []);

  async function toggleComplete(topic: Topic) {
    if (!path) return;
    setUpdatingId(topic.id);
    try {
      const res = await fetch(`/api/learning-path/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !topic.completed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update topic.");
        return;
      }

      setPath((prev) => {
        if (!prev) return prev;
        let previousCompleted = true;
        let foundCurrent = false;
        const topics = prev.topics.map((t) => {
          const completed = t.id === topic.id ? !topic.completed : t.completed;
          const locked = !previousCompleted;
          const isCurrent = !locked && !completed && !foundCurrent;
          if (isCurrent) foundCurrent = true;
          previousCompleted = previousCompleted && completed;
          return {
            ...t,
            completed,
            progressPercentage: completed ? 100 : 0,
            locked,
            isCurrent,
          };
        });
        const completedCount = topics.filter((t) => t.completed).length;
        return {
          ...prev,
          topics,
          completedCount,
          overallProgress:
            topics.length === 0
              ? 0
              : Math.round((completedCount / topics.length) * 100),
        };
      });
    } catch {
      setError("Failed to update topic.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
        {error}
      </p>
    );
  }

  if (!path) {
    return (
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold">
              No learning path yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete the onboarding assessment to get a personalized,
              AI-generated learning path.
            </p>
            <Link
              href="/onboarding/goal"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start assessment <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {path.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {path.completedCount} of {path.totalCount} topics completed
        </p>
      </div>

      {/* overall progress */}
      <div className="mt-6 rounded-xl border-2 border-border bg-card p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall progress</span>
          <span className="font-semibold text-primary">
            {path.overallProgress}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${path.overallProgress}%` }}
          />
        </div>
      </div>

      {/* roadmap */}
      <div className="relative mt-8 flex flex-col gap-6">
        {path.topics.map((topic, idx) => {
          const isLast = idx === path.topics.length - 1;
          return (
            <div key={topic.id} className="relative flex gap-4">
              {/* connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                    topic.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : topic.isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : topic.locked
                          ? "border-border bg-muted text-muted-foreground"
                          : "border-border bg-surface/40 text-muted-foreground",
                  )}
                >
                  {topic.completed ? (
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  ) : topic.locked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "mt-1 w-0.5 flex-1 rounded-full",
                      topic.completed ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>

              {/* card */}
              <div
                className={cn(
                  "mb-2 flex-1 rounded-xl border-2 p-5 transition-all",
                  topic.isCurrent
                    ? "border-primary bg-primary/5 shadow-(--shadow-glow)"
                    : "border-border bg-card",
                  topic.locked && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      difficultyStyles[topic.difficultyLevel] ??
                      "border-border bg-muted text-foreground"
                    }`}
                  >
                    {topic.difficultyLevel.toLowerCase()}
                  </span>
                  {topic.isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Sparkles className="h-3 w-3" /> Up next
                    </span>
                  )}
                  {topic.completed && (
                    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                      Completed
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-display text-lg font-semibold">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                )}

                {topic.resources.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {topic.resources.map((resource) => {
                      const Icon = resourceIcons[resource.type];
                      return (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm text-foreground/90 hover:border-primary/50 hover:text-primary"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{resource.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                        </a>
                      );
                    })}
                  </div>
                )}

                {!topic.locked && (
                  <button
                    onClick={() => toggleComplete(topic)}
                    disabled={updatingId === topic.id}
                    className={cn(
                      "mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
                      topic.completed
                        ? "border-border bg-surface/40 text-muted-foreground hover:bg-muted"
                        : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {updatingId === topic.id
                      ? "Updating…"
                      : topic.completed
                        ? "Mark as incomplete"
                        : "Mark as complete"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathPage;
