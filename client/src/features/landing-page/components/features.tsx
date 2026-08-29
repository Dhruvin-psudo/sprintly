import { BarChart3, Calendar, KanbanSquare, Shield, Users, Zap } from "lucide-react";
import { SectionHeader } from "./section-header";

export function Features() {
    const items = [
    { icon: KanbanSquare, title: "Fluid kanban", desc: "Drag, drop, group and filter. Boards that keep up with fast teams." },
    { icon: Calendar, title: "Sprint calendar", desc: "Monthly, weekly and timeline views for deadlines across projects." },
    { icon: Users, title: "Workspaces + roles", desc: "Isolated workspaces with Owner, Admin, Manager and Member roles." },
    { icon: BarChart3, title: "Sharp reports", desc: "Productivity, throughput and completion trends — updated live." },
    { icon: Zap, title: "AI planning", desc: "Break down goals into tasks and estimate effort in one click." },
    { icon: Shield, title: "Enterprise-ready", desc: "SSO, audit log, granular permissions and encrypted at rest." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader eyebrow="Features" title="Everything a fast team needs. Nothing they don't." />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/40 transition-colors">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4">
              <f.icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}