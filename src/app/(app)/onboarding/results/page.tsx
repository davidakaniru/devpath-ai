"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Loader,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface RecommendedPathItem {
  title: string;
  priority: number;
  reason: string;
}

interface Result {
  overallLevel: string;
  overallScore: number;
  confidenceProfile: string;
  strengths: string[];
  weaknesses: string[];
  categoryScores: Record<string, number>;
  recommendedPath: RecommendedPathItem[];
  summary: string;
}

const levelStyles: Record<string, string> = {
  BEGINNER: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function scoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
}

const OnboardingResultsPage = () => {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch("/api/assessment/result");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load results.");
          return;
        }
        setResult(data.result);
      } catch {
        setError("Failed to load results.");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background">
        <Loader size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="dark flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
            {error || "No results found."}
          </p>
          <Button className="mt-6" onClick={() => router.push("/onboarding/goal")}>
            Restart assessment <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const sortedPath = [...result.recommendedPath].sort(
    (a, b) => a.priority - b.priority,
  );

  return (
    <div
      className="dark min-h-screen bg-background px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg path-glow">
            <Route className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold">DevPath AI</span>
        </div>

        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step 2 of 2
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            Your assessment results
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s what we learned about your current skill level.
          </p>
        </div>

        {/* overall score + level */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border-2 border-border bg-card p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Gauge className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground">
              Overall Score
            </h3>
            <p className="mt-1 text-3xl font-bold">{result.overallScore}%</p>
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground">
              Skill Level
            </h3>
            <span
              className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-sm font-semibold ${
                levelStyles[result.overallLevel] ??
                "border-border bg-muted text-foreground"
              }`}
            >
              {result.overallLevel}
            </span>
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground">
              Confidence Profile
            </h3>
            <p className="mt-1 text-lg font-semibold">
              {result.confidenceProfile}
            </p>
          </div>
        </div>

        {/* category breakdown */}
        <div className="mt-6 rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Category Breakdown</h3>
          <div className="mt-4 flex flex-col gap-4">
            {Object.entries(result.categoryScores).map(([category, score]) => (
              <div key={category}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">{score}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${scoreColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* strengths + weaknesses */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="font-display font-semibold">Strengths</h3>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {result.strengths.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border-2 border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="font-display font-semibold">Areas to Improve</h3>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {result.weaknesses.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* recommended path */}
        <div className="mt-6 rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Recommended Learning Path</h3>
          <div className="mt-4 flex flex-col gap-3">
            {sortedPath.map((step, idx) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-lg border border-border bg-surface/40 p-4"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* summary */}
        <div className="mt-6 rounded-xl border-2 border-border bg-card p-6">
          <h3 className="font-display font-semibold">Summary</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {result.summary}
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <Button size="lg" onClick={() => router.push("/")}>
            Continue to dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingResultsPage;
