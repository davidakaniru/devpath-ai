"use client";

import { Button } from "@/components/ui/button";
import { Question } from "@/lib/types";
import {
  ArrowRight,
  Check,
  Loader,
  Route,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TOTAL_QUESTIONS = 15;

const difficultyStyles: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  hard: "bg-destructive/15 text-destructive border-destructive/30",
};

const confidenceLevels = [
  { value: "LOW", label: "Not sure", icon: ShieldQuestion },
  { value: "MEDIUM", label: "Fairly confident", icon: ShieldAlert },
  { value: "HIGH", label: "Very confident", icon: ShieldCheck },
] as const;

const OnboardingAssessment = () => {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/assessment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to analyze assessment.");
        toast.error(data.error ?? "Failed to analyze assessment.");
        return;
      }

      router.push("/onboarding/results");
    } catch {
      setError("Failed to analyze assessment.");
      toast.error("Failed to analyze assessment.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!selectedOption || !confidence || !question || !assessmentId) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/assessment/answer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          questionId: question.id,
          selectedOption,
          confidence,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        toast.error(data.error ?? "Something went wrong.");
        return;
      }

      if (data.completed) {
        await runAnalysis();
        return;
      }

      setQuestion(data.question);
      setSelectedOption(null);
      setConfidence(null);
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    async function start() {
      try {
        const res = await fetch("/api/assessment/start", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to start assessment.");
          return;
        }
        setAssessmentId(data.assessmentId);
        setQuestion(data.question);
      } catch {
        setError("Failed to start assessment.");
      } finally {
        setLoading(false);
      }
    }
    start();
  }, []);

  if (loading || analyzing) {
    return (
      <div
        className="dark flex min-h-screen flex-col items-center justify-center gap-4 bg-background"
        style={{ background: "var(--gradient-hero)" }}
      >
        <Loader size={32} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {analyzing ? "Analyzing your results…" : "Preparing your assessment…"}
        </p>
      </div>
    );
  }

  const progress = question
    ? ((question.questionNumber - 1) / TOTAL_QUESTIONS) * 100
    : 0;

  return (
    <div
      className="dark min-h-screen bg-background px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg path-glow">
            <Route className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold">DevPath AI</span>
        </div>

        {error && (
          <p className="mb-6 text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        {question && (
          <div>
            {/* progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary">
                <span>
                  Question {question.questionNumber} of {TOTAL_QUESTIONS}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* question card */}
            <div className="rounded-xl border-2 border-border bg-card p-6 shadow-(--shadow-card)">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    difficultyStyles[question.difficulty] ??
                    "border-border bg-muted text-foreground"
                  }`}
                >
                  {question.difficulty}
                </span>
                <span className="inline-flex rounded-full border border-border bg-surface/40 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {question.category}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl font-semibold leading-snug">
                {question.questionText}
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const isSelected = selectedOption === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedOption(key)}
                      className={`relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-(--shadow-glow)"
                          : "border-border bg-surface/40 hover:border-primary/50"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-sm leading-relaxed">
                        {question.options[key]}
                      </span>
                      {isSelected && (
                        <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* confidence */}
            <div className="mt-6 rounded-xl border-2 border-border bg-card p-6">
              <p className="text-sm font-semibold">How confident are you?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {confidenceLevels.map(({ value, label, icon: Icon }) => {
                  const isSelected = confidence === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setConfidence(value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-(--shadow-glow)"
                          : "border-border bg-surface/40 hover:border-primary/50"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                size="lg"
                disabled={!selectedOption || !confidence || submitting}
                onClick={handleSubmitAnswer}
              >
                {submitting
                  ? "Submitting…"
                  : question.questionNumber === TOTAL_QUESTIONS
                    ? "Finish assessment"
                    : "Next question"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingAssessment;
