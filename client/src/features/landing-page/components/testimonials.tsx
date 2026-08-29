import { Star } from "lucide-react";
import { SectionHeader } from "./section-header";

export function Testimonials() {
  const t = [
    { q: "Sprintly is the first PM tool my whole team actually opens every morning. It's fast, beautiful and gets out of the way.", a: "Priya Shah", r: "Head of Product, Northwind" },
    { q: "We migrated from three tools to just Sprintly. Sprint planning went from 90 minutes to 20.", a: "Marcus Reid", r: "CTO, Orbit" },
    { q: "It's the only tool where the reports view is actually useful. Our investors love the weekly ship report.", a: "Ana Iglesias", r: "Founder, Lumen" },
  ];
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader eyebrow="Loved by teams" title="What founders and PMs say." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {t.map((x) => (
            <div key={x.a} className="rounded-2xl border border-border/60 bg-card p-6 flex flex-col">
              <div className="flex gap-0.5 text-primary mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1">"{x.q}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="size-9 rounded-full bg-gradient-brand grid place-items-center text-xs font-bold text-white">
                  {x.a.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{x.a}</p>
                  <p className="text-xs text-muted-foreground">{x.r}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}