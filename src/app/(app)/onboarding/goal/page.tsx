"use client";
import { careerGoals } from "@/lib/data";
import { ArrowRight, Check, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const OnboardingGoal = () => {
  const [careerGoal, setCareerGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleContinue() {
    if (!careerGoal) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerGoal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/onboarding/assessment");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
            Step 1 of 2
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
            What&apos;s your developer goal?
          </h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll personalize your learning path to match.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {careerGoals.map(({ desc, id, title, icon: Icon, value }) => {
            const isSelected = value === careerGoal;
            return (
              <button
                key={id}
                onClick={() => setCareerGoal(value)}
                className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-(--shadow-glow)"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <button
            disabled={!careerGoal || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-(--shadow-glow) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            onClick={handleContinue}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGoal;
