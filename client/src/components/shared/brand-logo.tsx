import { Link } from "react-router-dom";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid size-8 place-items-center rounded-lg bg-gradient-brand shadow-glow ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7l4-3 4 3 4-3 4 3" />
        <path d="M4 12l4-3 4 3 4-3 4 3" />
        <path d="M4 17l4-3 4 3 4-3 4 3" />
      </svg>
    </div>
  );
}

export function BrandLogo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <BrandMark />
      <span className="text-lg font-bold tracking-tight">Sprintly</span>
    </Link>
  );
}