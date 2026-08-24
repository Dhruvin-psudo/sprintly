import { BrandLogo } from "@/components/shared/brand-logo";
import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3 md:col-span-1">
          <BrandLogo />
          <p className="text-sm text-muted-foreground max-w-xs">
            The opinionated project OS for startups and small agencies. Ship faster, together.
          </p>
        </div>
        <FooterCol title="Product" links={[["Features","/features"],["Pricing","/pricing"],["Changelog","#"],["Roadmap","#"]]} />
        <FooterCol title="Company" links={[["About","/about"],["Contact","/contact"],["Careers","#"],["Blog","#"]]} />
        <FooterCol title="Resources" links={[["Docs","#"],["Guides","#"],["Security","#"],["Status","#"]]} />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sprintly, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link to={href} className="hover:text-foreground">{label}</Link>
            ) : (
              <a href={href} className="hover:text-foreground">{label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}