import {
  dashboardStats,
  productivityData,
  completionByProject,
  upcomingDeadlines,
  teamActivity,
} from "../dummy-data";
import { dummyProjects } from "@/features/project/dummy-data";

export function useDashboardData() {
  // In the future, replace this with React Query hooks (e.g. useQuery)
  return {
    isLoading: false,
    stats: dashboardStats,
    productivity: productivityData,
    completion: completionByProject,
    deadlines: upcomingDeadlines,
    activity: teamActivity,
    activeProjects: dummyProjects.slice(0, 4),
    recentFiles: [
      { name: "Q3-roadmap.pdf", project: "GRW", size: "2.4 MB", time: "Today" },
      { name: "onboarding-v2.fig", project: "MAP", size: "18 MB", time: "Today" },
      { name: "pricing-copy.docx", project: "WEB", size: "112 KB", time: "Yesterday" },
      { name: "portal-invoice.pdf", project: "PRT", size: "540 KB", time: "Yesterday" },
      { name: "brand-tokens.json", project: "DS2", size: "38 KB", time: "2 days ago" },
    ],
  };
}
