export const dashboardStats = {
  totalProjects: { value: 6, trend: "+2 this month" },
  pendingTasks: { value: 11, trend: "12 due this week" },
  completed: { value: 3, trend: "+18% vs last week" },
  teamVelocity: { value: 84, trend: "pts / sprint" },
};

export const productivityData = [
  { day: "Mon", created: 8, completed: 12 },
  { day: "Tue", created: 15, completed: 18 },
  { day: "Wed", created: 9, completed: 14 },
  { day: "Thu", created: 16, completed: 22 },
  { day: "Fri", created: 18, completed: 12 },
  { day: "Sat", created: 5, completed: 6 },
  { day: "Sun", created: 4, completed: 5 },
];

export const completionByProject = [
  { name: "MAP", done: 34, remaining: 14 },
  { name: "WEB", done: 14, remaining: 18 },
  { name: "GRW", done: 21, remaining: 3 },
  { name: "DS2", done: 18, remaining: 42 },
  { name: "PRT", done: 40, remaining: 0 },
];

export const upcomingDeadlines = [
  { title: "Push notifications rollout", project: "MAP", date: "Aug 02", priority: "Urgent" },
  { title: "Audit onboarding funnel", project: "GRW", date: "Aug 05", priority: "High" },
  { title: "QA offline sync", project: "MAP", date: "Aug 06", priority: "Urgent" },
  { title: "Design empty states", project: "DS2", date: "Aug 08", priority: "Medium" },
];

export const teamActivity = [
  {
    user: { initials: "NP", name: "Noah Patel" },
    action: "moved",
    target: "Wire push notifications",
    destination: "In Progress",
    time: "2m ago",
  },
  {
    user: { initials: "IC", name: "Ivy Chen" },
    action: "commented on",
    target: "Audit onboarding funnel",
    destination: "",
    time: "18m ago",
  },
  {
    user: { initials: "LR", name: "Leo Ramirez" },
    action: "shipped",
    target: "Customer Portal v1",
    destination: "",
    time: "1h ago",
  },
  {
    user: { initials: "AM", name: "Ava Mitchell" },
    action: "created project",
    target: "AI Assistant Beta",
    destination: "",
    time: "3h ago",
  },
];
