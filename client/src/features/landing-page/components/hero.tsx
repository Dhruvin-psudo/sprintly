import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-150 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 size-80 rounded-full bg-[oklch(0.78_0.16_310/0.1)] blur-[100px] animate-pulse animation-duration-[4s]" />
        <div className="absolute bottom-1/4 left-1/4 size-60 rounded-full bg-primary/10 blur-[80px] animate-pulse animation-duration-[6s]" />

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
                "h-12 px-8 text-base bg-gradient-brand shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-white"
              )}
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            {/* <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-8 text-base"
              )}
            >
              See How It Works
            </a> */}
            <Link
                to="#features"
                className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-8 text-base"
              )}
            >
                See How It Works
            </Link>
          </div>
        </div>
      </section>
    )
}