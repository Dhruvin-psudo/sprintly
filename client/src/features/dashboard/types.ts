export interface ProductivityDayData {
  day: string;
  created: number;
  completed: number;
}

export interface DashboardStatsData {
  totalProjects: { value: number; trend: string };
  pendingProjects: { value: number; trend: string };
  completedProjects: { value: number; trend: string };
  projectVelocity: { value: number; trend: string };
}

export interface IUpcomingDeadline {
  title: string;
  project: string;
  date: string;
  priority: string;
}

export interface ICompletionByProject {
  name: string;
  done: number;
  remaining: number;
}

export interface IDashboardStatsResponse {
  stats: DashboardStatsData;
  deadlines: IUpcomingDeadline[];
  completion: ICompletionByProject[];
}

export interface ITeamActivity {
  user: { initials: string; name: string };
  action: string;
  target: string;
  destination: string;
  time: string;
}

