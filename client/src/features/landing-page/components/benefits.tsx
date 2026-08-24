import { Check } from "lucide-react";
import { SectionHeader } from "./section-header";

export function Benefits() {
  const stats = [
    { k: "3.2×", v: "faster sprint planning" },
    { k: "-47%", v: "meeting time reduced" },
    { k: "98%", v: "on-time deadline rate" },
    { k: "10k+", v: "tasks shipped weekly" },
  ];
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <SectionHeader eyebrow="Built for startups" title="Focus on shipping, not on your PM tool." align="left" />
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg">
            Sprintly is designed around the way modern teams actually work: small workspaces, fast feedback loops, and a UI that stays out of the way when you're heads-down.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Zero-config setup — invite the team and start.",
              "Keyboard-first navigation for power users.",
              "Weekly ship reports auto-generated for founders.",
              "Templates for design, engineering and marketing sprints.",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <Check className="size-4 text-primary mt-0.5 shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.v} className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-3xl font-bold text-gradient-brand">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}