import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  CalendarDays,
  Users,
  Settings,
} from "lucide-react";
import { PRIVATE_ROUTES } from "@/router/constants/routes";

const navItems = [
  { name: "Dashboard", to: PRIVATE_ROUTES.DASHBOARD, icon: LayoutDashboard, pathname: "/app/dashboard" },
  { name: "Projects", to: PRIVATE_ROUTES.PROJECTS, icon: FolderKanban, pathname: "/app/projects" },
  { name: "Board", to: PRIVATE_ROUTES.TASKS, icon: KanbanSquare, pathname: "/app/board" },
  { name: "Calendar", to: PRIVATE_ROUTES.CALENDAR, icon: CalendarDays, pathname: "/app/calendar" },
  { name: "Team", to: PRIVATE_ROUTES.MEMBERS, icon: Users, pathname: "/app/team" },
  { name: "Settings", to: PRIVATE_ROUTES.SETTINGS, icon: Settings, pathname: "/app/settings" },
];

export function AppSidebar() {
  const pathname = useLocation().pathname;
  return (
    <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex-col hidden md:flex h-full shrink-0">
      <div className="p-6 h-16 flex items-center border-b border-border/80">
        <BrandLogo />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 mt-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
            key={item.to}
            to={item.to}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
          >
            <item.icon className="size-4" />
            {item.name}
          </Link>
          )
        }
        )}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
          {/* Subtle gradient effect in the bottom left */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl pointer-events-none rounded-full" />
          <div className="relative z-10">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Upgrade to Team
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Unlimited projects, workspaces and priority support.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-background hover:bg-muted font-medium text-xs rounded-lg"
            >
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
