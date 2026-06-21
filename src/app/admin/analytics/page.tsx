"use client";

import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Loader,
  MessageSquare,
  Repeat,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AdminAnalyticsData {
  totalUsers: number;
  activeLearners: number;
  assessmentPerformance: {
    averageScore: number;
    completedAssessments: number;
    levelDistribution: { level: string; count: number }[];
  };
  aiUsage: {
    totalConversations: number;
    totalMessages: number;
    messagesLast7Days: number;
  };
  knowledgeRetention: {
    platformRetentionRate: number;
    totalReviewsLogged: number;
  };
}

const levelStyles: Record<string, string> = {
  Beginner: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Early Intermediate": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Advanced Intermediate":
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Senior Ready": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const LEVEL_ORDER = [
  "Beginner",
  "Early Intermediate",
  "Intermediate",
  "Advanced Intermediate",
  "Senior Ready",
];

const AdminAnalyticsPage = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load analytics.");
          return;
        }
        setError("");
        setData(json);
      } catch {
        setError("Failed to load analytics.");
      }
    }
    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const sortedLevels = [...data.assessmentPerformance.levelDistribution].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
  );
  const maxLevelCount = Math.max(1, ...sortedLevels.map((l) => l.count));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Platform Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate engagement, assessment performance, and retention across
          all learners.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={`${data.totalUsers}`} />
        <StatCard
          icon={TrendingUp}
          label="Active Learners (7d)"
          value={`${data.activeLearners}`}
          hint="Reviewed, completed a topic, or chatted"
        />
        <StatCard
          icon={Target}
          label="Avg. Assessment Score"
          value={`${data.assessmentPerformance.averageScore}%`}
          hint={`${data.assessmentPerformance.completedAssessments} completed`}
        />
        <StatCard
          icon={Repeat}
          label="Platform Retention"
          value={`${data.knowledgeRetention.platformRetentionRate}%`}
          hint={`${data.knowledgeRetention.totalReviewsLogged} reviews logged`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* level distribution */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">
            Skill Level Distribution
          </h3>
          {sortedLevels.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No completed assessments yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {sortedLevels.map(({ level, count }) => {
                const pct = Math.round((count / maxLevelCount) * 100);
                return (
                  <div key={level}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          levelStyles[level] ??
                            "border-border bg-muted text-foreground",
                        )}
                      >
                        {level}
                      </span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ai usage */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">AI Assistant Usage</h3>
          <div className="mt-4 flex flex-col gap-4">
            <UsageRow
              icon={MessageSquare}
              label="Total Conversations"
              value={data.aiUsage.totalConversations}
            />
            <UsageRow
              icon={BrainCircuit}
              label="Total Messages"
              value={data.aiUsage.totalMessages}
            />
            <UsageRow
              icon={TrendingUp}
              label="Messages (Last 7 Days)"
              value={data.aiUsage.messagesLast7Days}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-5">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function UsageRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/40 px-3.5 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1 text-sm text-foreground/90">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default AdminAnalyticsPage;
