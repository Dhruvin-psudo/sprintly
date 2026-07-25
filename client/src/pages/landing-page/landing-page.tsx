import { Link } from "react-router-dom";
import {
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  Layers,
  Clock,
  Shield,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Sprint Planning",
    description:
      "Break down work into manageable sprints with smart estimation and drag-and-drop prioritization.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Work together seamlessly with live updates, comments, and instant notifications across your team.",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track velocity, burndown charts, and team performance with beautiful, actionable dashboards.",
  },
  {
    icon: Layers,
    title: "Kanban & Backlog",
    description:
      "Visualize your workflow with customizable boards and a powerful backlog management system.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Built-in time tracking so you know exactly where effort goes — no third-party tools needed.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant with role-based access, SSO, and audit logs to keep your data safe.",
  },
];

const stats = [
  { value: "10K+", label: "Teams" },
  { value: "50M+", label: "Tasks Completed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Rating" },
];

export function LandingPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 size-80 rounded-full bg-[oklch(0.78_0.16_310_/_0.1)] blur-[100px] animate-pulse [animation-duration:4s]" />
        <div className="absolute bottom-1/4 left-1/4 size-60 rounded-full bg-primary/10 blur-[80px] animate-pulse [animation-duration:6s]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">
              Now in public beta — free to get started
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Project Management,{" "}
            <span className="text-gradient-brand">Supercharged</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Plan sprints, collaborate in real-time, and ship faster. Sprintly
            gives your team the agile toolkit they need — without the
            complexity.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-8 text-base bg-gradient-brand shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              )}
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-8 text-base"
              )}
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="relative border-y border-border bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <p className="text-3xl font-bold text-gradient-brand md:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="text-gradient-brand">ship faster</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for modern agile teams who want powerful tools without the
              steep learning curve.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your workflow?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of teams already shipping faster with Sprintly. Start
            free — no credit card required.
          </p>
          <div className="mt-10">
            <Link
              to="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-10 text-base bg-gradient-brand shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              )}
            >
              Start Free Trial
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
