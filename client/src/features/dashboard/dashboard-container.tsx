import { useDashboardData } from "./hooks/use-dashboard-data";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { ProductivityChart } from "./components/productivity-chart";
import { UpcomingDeadlines } from "./components/upcoming-deadlines";
import { ProjectCompletionChart } from "./components/project-completion-chart";
import { TeamActivity } from "./components/team-activity";
import { CalendarWidget } from "./components/calendar-widget";
import { ActiveProjects } from "./components/active-projects";
import { RecentFiles } from "./components/recent-files";
import { DashboardSkeleton } from "./components/dashboard-skeleton";

export function DashboardContainer() {
  const { isLoading, ...data } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <DashboardHeader />
      <DashboardStats data={data.stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductivityChart data={data.productivity} />
        <UpcomingDeadlines data={data.deadlines} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectCompletionChart data={data.completion} />
        <TeamActivity data={data.activity} />
        <CalendarWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActiveProjects data={data.activeProjects} />
        <RecentFiles data={data.recentFiles} />
      </div>
    </div>
  );
}
