import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PUBLIC_ROUTES } from "@/router/constants/routes";

const NAV_LINKS = [
  { label: "Features", to: PUBLIC_ROUTES.FEATURES },
  { label: "Pricing", to: PUBLIC_ROUTES.PRICING },
  { label: "About", to: PUBLIC_ROUTES.ABOUT },
  { label: "Contact", to: PUBLIC_ROUTES.CONTACT },
] as const;

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || mobileMenuOpen
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <BrandLogo />

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm transition-colors rounded-md",
                  isActive
                    ? "text-foreground font-medium bg-accent/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to={PUBLIC_ROUTES.LOGIN}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            Sign In
          </Link>
          <Link
            to={PUBLIC_ROUTES.REGISTER}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-gradient-brand hover:opacity-90 transition-opacity text-white"
            )}
          >
            Get Started
          </Link>
          <button
            className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 px-6 py-4 space-y-2 bg-background/95 backdrop-blur-xl">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "text-foreground font-medium bg-accent/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to={PUBLIC_ROUTES.LOGIN}
            className="block sm:hidden px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}

