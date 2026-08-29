import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function FinalCTA() {
    return (
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
                    "h-12 px-10 text-base bg-gradient-brand shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-white"
                )}
                >
                Start Free Trial
                <ArrowRight className="size-4" />
                </Link>
            </div>
            </div>
      </section>
    )
}