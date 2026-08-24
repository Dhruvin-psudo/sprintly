import { Outlet } from "react-router-dom";
import { BrandLogo } from "@/components/shared/brand-logo";

export function AuthLayout() {
  return (
    <div className="flex min-h-svh">
      {/* Left panel — decorative brand area (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-hero" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 size-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 size-56 rounded-full bg-[oklch(0.78_0.16_310/0.15)] blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-2/3 left-1/3 size-40 rounded-full bg-primary/10 blur-3xl animate-pulse [animation-delay:2s]" />

        {/* Brand content */}
        <div className="relative z-10 max-w-md px-8 text-center space-y-6">
          <BrandLogo />
          <h2 className="text-2xl font-bold text-foreground">
            Agile project management, simplified.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Plan sprints, collaborate in real-time, and ship faster with your
            entire team — all in one place.
          </p>

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* Mobile logo (hidden on desktop where the left panel shows it) */}
        <div className="mb-8 lg:hidden">
          <BrandLogo />
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
