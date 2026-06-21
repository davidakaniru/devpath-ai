"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Library,
  Loader,
  Repeat,
  Route as RouteIcon,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminAnalyticsData {
  totalUsers: number;
  activeLearners: number;
  assessmentPerformance: {
    averageScore: number;
    completedAssessments: number;
  };
  knowledgeRetention: {
    platformRetentionRate: number;
  };
}

interface RecommendationRow {
  id: string;
  userFullName: string;
  title: string;
  generatedAt: string;
}

interface AiInteractionRow {
  id: string;
  userFullName: string;
  messageCount: number;
  lastActiveAt: string;
}

const quickLinks = [
  {
    href: "/admin/users",
    label: "Users",
    description: "View every registered learner and admin.",
    icon: Users,
  },
  {
    href: "/admin/content",
    label: "Content",
    description: "Manage tracks, topics, and resources.",
    icon: Library,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    description: "Platform-wide engagement and performance.",
    icon: BarChart3,
  },
  {
    href: "/admin/monitoring",
    label: "Monitoring",
    description: "Generated paths and AI assistant activity.",
    icon: Activity,
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const AdminOverviewPage = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<
    RecommendationRow[] | null
  >(null);
  const [aiInteractions, setAiInteractions] = useState<
    AiInteractionRow[] | null
  >(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOverview() {
      try {
        const [analyticsRes, recommendationsRes, aiRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/monitoring/recommendations"),
          fetch("/api/admin/monitoring/ai-interactions"),
        ]);

        const [analyticsData, recommendationsData, aiData] =
          await Promise.all([
            analyticsRes.json(),
            recommendationsRes.json(),
            aiRes.json(),
          ]);

        if (!analyticsRes.ok) {
          setError(analyticsData.error ?? "Failed to load overview.");
          return;
        }

        setError("");
        setAnalytics(analyticsData);
        setRecommendations(
          recommendationsRes.ok ? recommendationsData.paths.slice(0, 5) : [],
        );
        setAiInteractions(
          aiRes.ok ? aiData.conversations.slice(0, 5) : [],
        );
      } catch {
        setError("Failed to load overview.");
      }
    }
    fetchOverview();
  }, []);

  if (error) {
    return (
      <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
        {error}
      </p>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of platform activity, performance, and engagement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={`${analytics.totalUsers}`} />
        <StatCard
          icon={TrendingUp}
          label="Active Learners (7d)"
          value={`${analytics.activeLearners}`}
        />
        <StatCard
          icon={Target}
          label="Avg. Assessment Score"
          value={`${analytics.assessmentPerformance.averageScore}%`}
          hint={`${analytics.assessmentPerformance.completedAssessments} completed`}
        />
        <StatCard
          icon={Repeat}
          label="Platform Retention"
          value={`${analytics.knowledgeRetention.platformRetentionRate}%`}
        />
      </div>

      {/* quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border-2 border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold">{label}</h3>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* recent learning paths */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">
              Recent Learning Paths
            </h3>
            <Link
              href="/admin/monitoring"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {!recommendations || recommendations.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No learning paths generated yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {recommendations.map((path) => (
                <div key={path.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <RouteIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {path.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {path.userFullName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(path.generatedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* recent ai conversations */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">
              Recent AI Conversations
            </h3>
            <Link
              href="/admin/monitoring"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {!aiInteractions || aiInteractions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No AI assistant conversations yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {aiInteractions.map((conversation) => (
                <div key={conversation.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {conversation.userFullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.messageCount} message
                      {conversation.messageCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(conversation.lastActiveAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
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
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>
      )}
    </div>
  );
}

export default AdminOverviewPage;
