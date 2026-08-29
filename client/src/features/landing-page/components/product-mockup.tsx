export function ProductMockup() {
    return (
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="relative rounded-2xl border border-border/60 bg-card overflow-hidden shadow-glow">
        <div className="flex items-center gap-2 px-4 h-9 border-b border-border/60 bg-muted/40">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500/70" />
            <div className="size-2.5 rounded-full bg-amber-500/70" />
            <div className="size-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="ml-4 text-xs text-muted-foreground">sprintly.app / nebula-studio / board</div>
        </div>
        <div className="grid grid-cols-5 gap-3 p-4 min-h-105">
          {["Backlog", "To Do", "In Progress", "Review", "Done"].map((col, ci) => (
            <div key={col} className="rounded-xl bg-muted/30 border border-border/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">{col}</p>
                <span className="text-[10px] text-muted-foreground">{[6, 4, 3, 2, 5][ci]}</span>
              </div>
              {Array.from({ length: [3, 2, 2, 1, 2][ci] }).map((_, i) => (
                <div key={i} className="rounded-lg bg-card border border-border/60 p-3 space-y-2 shadow-sm">
                  <div className="h-2 w-3/4 rounded bg-muted-foreground/20" />
                  <div className="h-2 w-1/2 rounded bg-muted-foreground/10" />
                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      ["bg-blue-500/15 text-blue-400","bg-amber-500/15 text-amber-400","bg-rose-500/15 text-rose-400"][i%3]
                    }`}>
                      {["Medium","High","Urgent"][i%3]}
                    </span>
                    <div className="flex -space-x-1">
                      <div className="size-4 rounded-full bg-gradient-brand ring-2 ring-card" />
                      <div className="size-4 rounded-full bg-indigo-500 ring-2 ring-card" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
    )
}