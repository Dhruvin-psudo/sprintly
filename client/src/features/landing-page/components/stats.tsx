export function Stats() {
    const stats = [
        { value: "10K+", label: "Teams" },
        { value: "50M+", label: "Tasks Completed" },
        { value: "99.9%", label: "Uptime" },
        { value: "4.9★", label: "Rating" },
    ];
    return (
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
    )
}