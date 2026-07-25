import { clearAccessToken } from "@/api";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/router/constants/routes";
import { LogOut, LayoutDashboard, Layers, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function DashboardPage() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAccessToken();
    toast.info("Logged out successfully");
    navigate(PUBLIC_ROUTES.LOGIN);
  }

  return (
    <div className="min-h-svh flex flex-col bg-background text-foreground">
      {/* Dashboard Top Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-hero p-8">
          <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
              <Zap className="size-3.5" /> Stage-2 Authenticated
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome to your <span className="text-gradient-brand">Dashboard</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Your organization has been successfully configured. You now have full access to sprint planning, backlog management, and team collaboration tools.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Active Sprints</span>
              <Layers className="size-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">1</p>
            <p className="text-xs text-muted-foreground">Sprint #1 in progress</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Team Members</span>
              <Users className="size-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">1</p>
            <p className="text-xs text-muted-foreground">Owner (You)</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">Projects</span>
              <LayoutDashboard className="size-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Ready to create first project</p>
          </div>
        </div>
      </main>
    </div>
  );
}
