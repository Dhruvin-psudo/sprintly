export interface ProjectActivityItem {
  id: string;
  actor: string;
  initials: string;
  action: string;
  object?: string;
  when: string;
  kind: "task" | "status" | "member" | "edit";
  group: string;
}

export const ACTIVITY_GROUPS = ["Today", "Yesterday", "Earlier this week"];

export const PROJECT_ACTIVITY_FULL: ProjectActivityItem[] = [
  {
    id: "a1",
    actor: "Ava Mitchell",
    initials: "AM",
    action: "completed task",
    object: "Setup CI/CD pipeline",
    when: "10 minutes ago",
    kind: "task",
    group: "Today",
  },
  {
    id: "a2",
    actor: "Noah Patel",
    initials: "NP",
    action: "changed status of project to",
    object: "Active",
    when: "1 hour ago",
    kind: "status",
    group: "Today",
  },
  {
    id: "a3",
    actor: "Ivy Chen",
    initials: "IC",
    action: "added member",
    object: "Maya Okafor",
    when: "3 hours ago",
    kind: "member",
    group: "Today",
  },
  {
    id: "a4",
    actor: "Leo Ramirez",
    initials: "LR",
    action: "updated project description",
    when: "Yesterday at 4:15 PM",
    kind: "edit",
    group: "Yesterday",
  },
  {
    id: "a5",
    actor: "Maya Okafor",
    initials: "MO",
    action: "assigned task",
    object: "Database schema migration",
    when: "Yesterday at 2:30 PM",
    kind: "task",
    group: "Yesterday",
  },
  {
    id: "a6",
    actor: "Ken Watanabe",
    initials: "KW",
    action: "created new task",
    object: "Implement authentication flow",
    when: "Aug 16, 2026",
    kind: "task",
    group: "Earlier this week",
  },
  {
    id: "a7",
    actor: "Ava Mitchell",
    initials: "AM",
    action: "created project",
    object: "Sprintly Client",
    when: "Aug 15, 2026",
    kind: "edit",
    group: "Earlier this week",
  },
];
