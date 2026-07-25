import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PUBLIC_ROUTES } from "@/router/constants/routes";

const NAV_LINK_CLASS =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing"},
  { label: "About", href: "#stats" },
  { label: "Contact", href: "#contact"}
] as const;

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

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
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={NAV_LINK_CLASS}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to={PUBLIC_ROUTES.LOGIN}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Sign In
          </Link>
          <Link
            to={PUBLIC_ROUTES.REGISTER}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-gradient-brand hover:opacity-90 transition-opacity"
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
