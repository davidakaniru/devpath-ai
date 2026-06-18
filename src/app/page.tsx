import { careerGoals } from "@/lib/data";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  ClipboardCheck,
  GitBranch,
  RotateCcw,
  RouteIcon,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: RouteIcon,
    title: "Personalized Learning Paths",
    desc: "Content adapts to your career goals, skill level, and pace.",
  },
  {
    icon: Bot,
    title: "AI Learning Assistant",
    desc: "On-demand explanations, code reviews, and guidance from a topic-aware tutor.",
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    desc: "Track performance, progress, and retention with rich data visualizations.",
  },
  {
    icon: RotateCcw,
    title: "Smart Revision Scheduling",
    desc: "SM-2 spaced repetition keeps everything you learn in long-term memory.",
  },
];

const steps = [
  { icon: Target, title: "Choose a Career Goal" },
  { icon: ClipboardCheck, title: "Take a Skill Assessment" },
  { icon: GitBranch, title: "Get a Personalized Path" },
  { icon: BookOpen, title: "Learn, Practice, Retain" },
];

export default function Home() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg path-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">DevPath AI</span>
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#tracks" className="hover:text-foreground">
              Tracks
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, oklch(0.55 0.24 275 / 0.4), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.7 0.18 230 / 0.3), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-32 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> AI-powered adaptive learning
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tighter md:text-7xl">
            Learn Smarter. <span className="text-gradient">Grow Faster.</span>
            <br />
            Become a Better Developer.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI-powered adaptive learning paths designed to help developers
            master technical skills efficiently while improving long-term
            knowledge retention.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-(--shadow-glow) hover:opacity-90"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#tracks"
              className="rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
            >
              Explore Learning Tracks
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-4xl font-bold tracking-tight">
          What makes DevPath AI different?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Built for how developers actually learn — adaptive, data-driven, and
          always on.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="surface-card p-6 transition-all hover:border-primary/40 hover:shadow-(--shadow-glow)"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-border bg-card/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-4xl font-bold tracking-tight">
            How it works
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="surface-card flex flex-col items-center p-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-glow text-white">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-semibold text-primary">
                    Step {i + 1}
                  </div>
                  <div className="mt-1 font-display font-semibold">
                    {s.title}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-primary md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tracks" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center font-display text-4xl font-bold tracking-tight">
          Learning Tracks
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Pick a career goal and get a personalized, AI-generated learning path.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {careerGoals.map(({ desc, icon: Icon, id, title }) => (
            <div
              key={id}
              className="surface-card p-6 text-left transition-all hover:border-primary/40 hover:shadow-(--shadow-glow)"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-(--shadow-glow) hover:opacity-90"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <div>© 2026 DevPath AI</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">
              About
            </a>
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
