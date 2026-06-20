import { getAnalyticsData } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Clock,
  Flame,
  Gauge,
  Repeat,
  Target,
} from "lucide-react";
import { redirect } from "next/navigation";

const difficultyStyles: Record<string, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
};

const ratingStyles: Record<string, { label: string; bar: string; text: string }> = {
  AGAIN: { label: "Again", bar: "bg-destructive", text: "text-destructive" },
  HARD: { label: "Hard", bar: "bg-amber-500", text: "text-amber-400" },
  GOOD: { label: "Good", bar: "bg-primary", text: "text-primary" },
  EASY: { label: "Easy", bar: "bg-emerald-500", text: "text-emerald-400" },
};

const RATING_ORDER = ["AGAIN", "HARD", "GOOD", "EASY"] as const;

function scoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
}

const AnalyticsPage = async () => {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getAnalyticsData(session.userId);

  const maxActivity = Math.max(1, ...data.activity.map((a) => a.count));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your learning activity, retention, and progress over time.
        </p>
      </div>

      {!data.analytics ? (
        <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-card p-6 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Analytics will appear here once you start completing topics and
          revision reviews.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Gauge}
            label="Topics Completed"
            value={`${data.analytics.topicsCompleted}`}
          />
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* category scores */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Skill Breakdown</h3>
          {!data.categoryScores ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Complete the onboarding assessment to see a breakdown by
              category.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {Object.entries(data.categoryScores).map(([category, score]) => (
                <div key={category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{score}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        scoreColor(score),
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* rating breakdown */}
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Revision Recall</h3>
          {data.totalReviews === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Review a topic in Revision to see how well you&apos;re recalling
              what you&apos;ve learned.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {RATING_ORDER.map((rating) => {
                const count = data.ratingBreakdown[rating];
                const pct = Math.round((count / data.totalReviews) * 100);
                const style = ratingStyles[rating];
                return (
                  <div key={rating}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className={cn("font-medium", style.text)}>
                        {style.label}
                      </span>
                      <span className="text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", style.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* activity */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <h3 className="font-display font-semibold">Last 14 Days</h3>
        {data.activity.every((a) => a.count === 0) ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No revision activity logged in the last two weeks.
          </p>
        ) : (
          <div className="mt-5 flex items-end gap-2">
            {data.activity.map(({ date, count }) => {
              const heightPct = Math.max(6, (count / maxActivity) * 100);
              const day = new Date(date);
              return (
                <div
                  key={date}
                  className="flex flex-1 flex-col items-center gap-2"
                  title={`${day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${count} review${count === 1 ? "" : "s"}`}
                >
                  <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-muted">
                    <div
                      className={cn(
                        "w-full rounded-md transition-all",
                        count > 0 ? "bg-primary" : "bg-transparent",
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {day.toLocaleDateString(undefined, { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* difficulty breakdown */}
      {data.difficultyBreakdown.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Progress by Difficulty</h3>
          <div className="mt-4 flex flex-col gap-4">
            {data.difficultyBreakdown.map(
              ({ difficultyLevel, completed, total }) => {
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={difficultyLevel}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                          difficultyStyles[difficultyLevel] ??
                            "border-border bg-muted text-foreground",
                        )}
                      >
                        {difficultyLevel.toLowerCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {completed} / {total}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
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
    </div>
  );
}

export default AnalyticsPage;
