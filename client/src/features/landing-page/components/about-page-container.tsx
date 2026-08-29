const team = [
  { name: "Ava Mitchell", role: "Co-founder & CEO", initials: "AM" },
  { name: "Noah Patel", role: "Co-founder & CTO", initials: "NP" },
  { name: "Ivy Chen", role: "Head of Design", initials: "IC" },
  { name: "Leo Ramirez", role: "Engineering Lead", initials: "LR" },
  { name: "Sara Lindqvist", role: "Head of Marketing", initials: "SL" },
  { name: "Ken Watanabe", role: "Product Manager", initials: "KW" },
];

export function AboutPageContainer() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">About</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight">
          We build tools that make teams faster.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Sprintly started in 2022 as an internal tool at a small agency drowning in Trello boards and Notion pages. We rebuilt it from scratch with one goal: give small teams a beautiful, opinionated product that stays out of the way. Today we're a remote-first team of 18, based in 9 countries.
        </p>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid gap-6 sm:grid-cols-3">
          {[
            { k: "2022", v: "Founded in Lisbon" },
            { k: "18", v: "Team members worldwide" },
            { k: "4,000+", v: "Teams shipping with Sprintly" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <p className="text-4xl font-bold text-gradient-brand">{s.k}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center">The team</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5">
              <div className="size-12 rounded-full bg-gradient-brand grid place-items-center text-sm font-bold text-white">
                {m.initials}
              </div>
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
