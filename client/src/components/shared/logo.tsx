import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/api";
import { PRIVATE_ROUTES } from "@/router/constants/routes";

interface LogoProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { icon: "size-5", text: "text-base" },
  default: { icon: "size-6", text: "text-lg" },
  lg: { icon: "size-8", text: "text-2xl" },
} as const;

export function Logo({ size = "default", className }: LogoProps) {
  const s = sizeMap[size];
  const token = getAccessToken();
  const targetPath = token ? PRIVATE_ROUTES.DASHBOARD : "/";

  return (
    <Link
      to={targetPath}
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      {/* Bolt-style SVG icon */}
      <svg
        className={cn(s.icon, "shrink-0")}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.68 0.2 300)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 310)" />
          </linearGradient>
        </defs>
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          fill="url(#logo-grad)"
          stroke="url(#logo-grad)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn(s.text, "font-bold tracking-tight")}>
        Sprintly
      </span>
    </Link>
  );
}
