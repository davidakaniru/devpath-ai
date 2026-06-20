import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { CAREER_GOAL_LABELS } from "@/lib/prompts/assessment";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  Repeat,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const levelStyles: Record<string, string> = {
  Beginner: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Early Intermediate": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Advanced Intermediate":
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Senior Ready": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const difficultyStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
};

const Dashboard = async () => {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getDashboardData(session.userId);

  const careerGoalLabel = data.user.careerGoal
    ? CAREER_GOAL_LABELS[data.user.careerGoal] ?? data.user.careerGoal
    : null;

  const nextTopic = data.learningPath?.topics.find((t) => !t.completed);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome back, {data.user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {careerGoalLabel
              ? `Tracking your progress toward ${careerGoalLabel}.`
              : "Complete onboarding to get a personalized learning path."}
          </p>
        </div>
        {data.user.experienceLevel && (
          <span className="inline-flex shrink-0 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs font-semibold capitalize text-foreground/90">
            {data.user.experienceLevel.toLowerCase()}
          </span>
        )}
      </div>

      {/* onboarding CTA */}
      {!data.learningPath && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold">
                Let&apos;s build your learning path
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Take a short skill assessment so we can personalize your
                roadmap and track your progress.
              </p>
              <Button asChild className="mt-4">
                <Link href="/onboarding/goal">
                  Start assessment <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Overall Progress"
          value={`${data.progress.percentComplete}%`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Topics Completed"
          value={`${data.progress.completedCount} / ${data.progress.totalCount}`}
        />
        <StatCard
          icon={Flame}
          label="Learning Streak"
          value={data.analytics ? `${data.analytics.learningStreak}d` : "—"}
          hint={!data.analytics ? "Coming soon" : undefined}
        />
        <StatCard
          icon={Repeat}
          label="Due for Revision"
          value={`${data.revisionQueueCount}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* continue learning */}
        <div className="lg:col-span-2 rounded-xl border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Continue Learning</h3>
            {data.learningPath && (
              <Link
                href="/learning-path"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View full path
              </Link>
            )}
          </div>

          {!data.learningPath ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Your learning path will appear here once you complete the
              onboarding assessment.
            </p>
          ) : nextTopic ? (
            <div className="mt-4 rounded-lg border border-border bg-surface/40 p-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                    difficultyStyles[nextTopic.difficultyLevel] ??
                      "border-border bg-muted text-foreground",
                  )}
                >
                  {nextTopic.difficultyLevel.toLowerCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  Topic {nextTopic.sequenceOrder + 1} of{" "}
                  {data.progress.totalCount}
                </span>
              </div>
              <h4 className="mt-3 font-medium">{nextTopic.title}</h4>
              <Button asChild className="mt-4" size="sm">
                <Link href="/learning-path">
                  Continue <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              You&apos;ve completed every topic in your learning path.
            </div>
          )}

          {data.learningPath && data.learningPath.topics.length > 0 && (
            <div className="mt-5 flex flex-col gap-2">
              {data.learningPath.topics.slice(0, 5).map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                >
                  {topic.completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border" />
                  )}
                  <span
                    className={cn(
                      "flex-1 truncate text-sm",
                      topic.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {topic.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* skill snapshot */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Skill Snapshot</h3>
          {!data.latestResult ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Complete an assessment to see your skill level, strengths, and
              areas to improve.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level</span>
                <span
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    levelStyles[data.latestResult.overallLevel] ??
                      "border-border bg-muted text-foreground",
                  )}
                >
                  {data.latestResult.overallLevel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="text-sm font-semibold">
                  {data.latestResult.overallScore}%
                </span>
              </div>

              {data.latestResult.strengths.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" /> Strengths
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.latestResult.strengths.join(", ")}
                  </p>
                </div>
              )}

              {data.latestResult.weaknesses.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> Areas to improve
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.latestResult.weaknesses.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* analytics */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <h3 className="font-display font-semibold">Analytics</h3>
        {!data.analytics ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Analytics will appear here once you start completing topics.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={Target}
              label="Average Score"
              value={`${Math.round(data.analytics.averageScore)}%`}
            />
            <StatCard
              icon={Flame}
              label="Learning Streak"
              value={`${data.analytics.learningStreak}d`}
            />
            <StatCard
              icon={Repeat}
              label="Retention Rate"
              value={`${Math.round(data.analytics.retentionRate)}%`}
            />
          </div>
        )}
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
  icon: typeof Gauge;
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

export default Dashboard;
