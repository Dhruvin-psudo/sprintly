import { SectionHeader } from "./section-header";

export function HowItWorks() {
  const steps = [
    { n: "01", t: "Create a workspace", d: "Set up your team, invite members, and pick a template." },
    { n: "02", t: "Plan the sprint", d: "Break work into tasks, assign owners, set priorities and due dates." },
    { n: "03", t: "Ship, review, repeat", d: "Drag tasks across the board and celebrate wins in the activity feed." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader eyebrow="How it works" title="From zero to shipping in under 5 minutes." />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="text-xs font-mono text-primary">{s.n}</p>
            <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}