import { Logo } from "@/components/shared/logo";

const NAV_LINK_CLASS =
  "text-sm text-muted-foreground hover:text-foreground transition-colors";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={NAV_LINK_CLASS}>
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sprintly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
