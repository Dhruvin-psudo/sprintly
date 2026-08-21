import type { ITeamActivity } from '../types';

const mockTeamActivity: ITeamActivity[] = [
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

export function useTeamActivityMock() {
  return {
    data: mockTeamActivity,
    isLoading: false,
  };
}
