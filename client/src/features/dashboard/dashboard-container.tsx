import { useDashboardStats } from "./hooks/use-dashboard-stats";
import { useProductivityData } from "./hooks/use-productivity-data";
import { useActiveProjects } from "./hooks/use-active-projects";
import { useTeamActivityMock } from "./hooks/use-team-activity-mock";

import { DashboardHeader } from "./components/dashboard-header";
import { DashboardStats } from "./components/dashboard-stats";
import { ProductivityChart } from "./components/productivity-chart";
import { UpcomingDeadlines } from "./components/upcoming-deadlines";
import { ProjectCompletionChart } from "./components/project-completion-chart";
import { TeamActivity } from "./components/team-activity";
import { ActiveProjects } from "./components/active-projects";
import { DashboardSkeleton } from "./components/dashboard-skeleton";

export function DashboardContainer() {
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
  const { data: productivityData, isLoading: isProductivityLoading } = useProductivityData();
  const { data: projectsResponse, isLoading: isProjectsLoading } = useActiveProjects(3);
  const { data: activityData } = useTeamActivityMock();

  const isLoading = isStatsLoading || isProductivityLoading || isProjectsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <DashboardHeader />
      <DashboardStats data={statsData?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductivityChart data={productivityData || []} />
        <UpcomingDeadlines data={statsData?.deadlines || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProjectCompletionChart data={statsData?.completion || []} />
        <TeamActivity data={activityData} />
        <ActiveProjects data={projectsResponse?.data ? [...projectsResponse.data] : []} />
      </div>
    </div>
  );
}

