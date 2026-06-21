"use client";

import { CAREER_GOAL_LABELS } from "@/lib/prompts/assessment";
import { cn } from "@/lib/utils";
import { Loader, MessageSquare, Route as RouteIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface RecommendationRow {
  id: string;
  userFullName: string;
  userEmail: string;
  careerGoal: string | null;
  title: string;
  topicCount: number;
  generatedAt: string;
}

interface AiInteractionRow {
  id: string;
  userFullName: string;
  userEmail: string;
  messageCount: number;
  lastActiveAt: string;
}

const tabs = [
  { key: "recommendations", label: "Recommendations", icon: RouteIcon },
  { key: "ai-interactions", label: "AI Interactions", icon: MessageSquare },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const AdminMonitoringPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("recommendations");

  const [recommendations, setRecommendations] = useState<
    RecommendationRow[] | null
  >(null);
  const [recommendationsError, setRecommendationsError] = useState("");

  const [aiInteractions, setAiInteractions] = useState<
    AiInteractionRow[] | null
  >(null);
  const [aiInteractionsError, setAiInteractionsError] = useState("");

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/admin/monitoring/recommendations");
        const data = await res.json();
        if (!res.ok) {
          setRecommendationsError(data.error ?? "Failed to load recommendations.");
          return;
        }
        setRecommendationsError("");
        setRecommendations(data.paths);
      } catch {
        setRecommendationsError("Failed to load recommendations.");
      }
    }
    fetchRecommendations();
  }, []);

  useEffect(() => {
    async function fetchAiInteractions() {
      try {
        const res = await fetch("/api/admin/monitoring/ai-interactions");
        const data = await res.json();
        if (!res.ok) {
          setAiInteractionsError(data.error ?? "Failed to load AI interactions.");
          return;
        }
        setAiInteractionsError("");
        setAiInteractions(data.conversations);
      } catch {
        setAiInteractionsError("Failed to load AI interactions.");
      }
    }
    fetchAiInteractions();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Monitoring
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generated learning paths and AI assistant activity across the
          platform.
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
              activeTab === key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface/40 text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "recommendations" && (
        <RecommendationsTable
          recommendations={recommendations}
          error={recommendationsError}
        />
      )}

      {activeTab === "ai-interactions" && (
        <AiInteractionsTable
          interactions={aiInteractions}
          error={aiInteractionsError}
        />
      )}
    </div>
  );
};

function RecommendationsTable({
  recommendations,
  error,
}: {
  recommendations: RecommendationRow[] | null;
  error: string;
}) {
  if (error) {
    return (
      <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
        {error}
      </p>
    );
  }

  if (!recommendations) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <p className="rounded-xl border-2 border-border bg-card p-6 text-sm text-muted-foreground">
        No learning paths have been generated yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-border bg-card">
      <table className="w-full min-w-200 text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3 font-semibold">Learner</th>
            <th className="px-5 py-3 font-semibold">Career Goal</th>
            <th className="px-5 py-3 font-semibold">Path Title</th>
            <th className="px-5 py-3 font-semibold">Topics</th>
            <th className="px-5 py-3 font-semibold">Generated</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((path) => (
            <tr
              key={path.id}
              className="border-b border-border last:border-0 hover:bg-surface/40"
            >
              <td className="px-5 py-3">
                <p className="font-medium">{path.userFullName}</p>
                <p className="text-xs text-muted-foreground">
                  {path.userEmail}
                </p>
              </td>
              <td className="px-5 py-3 text-muted-foreground">
                {path.careerGoal
                  ? CAREER_GOAL_LABELS[path.careerGoal] ?? path.careerGoal
                  : "—"}
              </td>
              <td className="px-5 py-3">{path.title}</td>
              <td className="px-5 py-3">{path.topicCount}</td>
              <td className="px-5 py-3 text-muted-foreground">
                {formatDate(path.generatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiInteractionsTable({
  interactions,
  error,
}: {
  interactions: AiInteractionRow[] | null;
  error: string;
}) {
  if (error) {
    return (
      <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
        {error}
      </p>
    );
  }

  if (!interactions) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <p className="rounded-xl border-2 border-border bg-card p-6 text-sm text-muted-foreground">
        No AI assistant conversations yet.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Showing activity metadata only — message content is never queried by
        this view.
      </p>
      <div className="overflow-x-auto rounded-xl border-2 border-border bg-card">
        <table className="w-full min-w-150 text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-semibold">Learner</th>
              <th className="px-5 py-3 font-semibold">Messages</th>
              <th className="px-5 py-3 font-semibold">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((conversation) => (
              <tr
                key={conversation.id}
                className="border-b border-border last:border-0 hover:bg-surface/40"
              >
                <td className="px-5 py-3">
                  <p className="font-medium">{conversation.userFullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.userEmail}
                  </p>
                </td>
                <td className="px-5 py-3">{conversation.messageCount}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatDate(conversation.lastActiveAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminMonitoringPage;
