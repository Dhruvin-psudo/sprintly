import { Link } from "react-router-dom";
import {
  KanbanSquare,
  Calendar,
  Users,
  BarChart3,
  Zap,
  Shield,
  Bell,
  FileText,
  Layers,
  GitBranch,
  Filter,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/router/constants/routes";

const groups = [
  {
    title: "Plan work",
    items: [
      { icon: KanbanSquare, name: "Kanban boards", desc: "Fluid columns with keyboard shortcuts and instant filtering." },
      { icon: Calendar, name: "Sprint calendar", desc: "Month, week and timeline views across every project." },
      { icon: Layers, name: "Templates", desc: "Ready-made sprint templates for design, eng and marketing." },
      { icon: Filter, name: "Smart filters", desc: "Save filters by assignee, priority, project or deadline." },
    ],
  },
  {
    title: "Collaborate",
    items: [
      { icon: Users, name: "Workspaces & roles", desc: "Isolate teams and control access with Owner, Admin, Manager, Member." },
      { icon: Bell, name: "Focused notifications", desc: "Only what matters — grouped by project, digest by day." },
      { icon: FileText, name: "Comments & files", desc: "Threaded comments, mentions and unlimited attachments." },
      { icon: GitBranch, name: "Integrations", desc: "GitHub, Linear import, Slack, Figma, Notion and more." },
    ],
  },
  {
    title: "Understand progress",
    items: [
      { icon: BarChart3, name: "Reports", desc: "Throughput, completion and productivity by team or project." },
      { icon: Clock, name: "Time tracking", desc: "Optional per-project timers with weekly summaries." },
      { icon: Zap, name: "AI planning", desc: "Break down goals into tasks and estimate effort automatically." },
      { icon: Shield, name: "Enterprise security", desc: "SSO, audit log, encryption and granular permissions." },
    ],
  },
];

export function FeaturesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 text-center">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Features</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight">
          Every tool a modern team needs
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-muted-foreground text-lg">
          Sprintly bundles planning, collaboration and reporting into one focused product — without the feature bloat of legacy PM tools.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="text-2xl font-bold tracking-tight">{g.title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {g.items.map((it) => (
                <div key={it.name} className="rounded-2xl border border-border/60 bg-card p-6">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4">
                    <it.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">{it.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 text-center">
        <div className="rounded-3xl border border-border/60 bg-gradient-hero p-12">
          <h2 className="text-3xl sm:text-4xl font-bold">See it in action</h2>
          <p className="mt-3 text-muted-foreground">Get a free workspace and invite your team in seconds.</p>
          <Link to={PUBLIC_ROUTES.REGISTER}>
            <Button size="lg" className="mt-6 bg-gradient-brand text-white hover:opacity-90 shadow-glow">Start free</Button>
          </Link>
        </div>
      </section>
    </>
  );
}