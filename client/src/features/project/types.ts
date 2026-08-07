export const ProjectPhase = {
  PLANNING:"PLANNING",
  ACTIVE:"ACTIVE",
  ON_HOLD:"ON_HOLD",
  COMPLETED:"COMPLETED",
  CANCELLED:"CANCELLED",
} as const;

export type ProjectPhase = (typeof ProjectPhase)[keyof typeof ProjectPhase];

export const ProjectPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type ProjectPriority = (typeof ProjectPriority)[keyof typeof ProjectPriority];

export const OrderBy = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export type OrderBy = (typeof OrderBy)[keyof typeof OrderBy];

export interface WorkspaceMember {
  id: string;
  name: string;
  initials: string;
  role: "Owner" | "Admin" | "Manager" | "Member";
  roleColor: string;
  avatarColor: string;
}

export const MOCK_WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: "mem-1", name: "Ava Mitchell", initials: "AM", role: "Owner", roleColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", avatarColor: "bg-purple-500 text-white" },
  { id: "mem-2", name: "Noah Patel", initials: "NP", role: "Admin", roleColor: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300", avatarColor: "bg-pink-500 text-white" },
  { id: "mem-3", name: "Ivy Chen", initials: "IC", role: "Manager", roleColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", avatarColor: "bg-indigo-500 text-white" },
  { id: "mem-4", name: "Leo Ramirez", initials: "LR", role: "Manager", roleColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", avatarColor: "bg-violet-500 text-white" },
  { id: "mem-5", name: "Maya Okafor", initials: "MO", role: "Member", roleColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", avatarColor: "bg-fuchsia-500 text-white" },
  { id: "mem-6", name: "Ken Watanabe", initials: "KW", role: "Member", roleColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", avatarColor: "bg-purple-600 text-white" },
  { id: "mem-7", name: "Sara Lindqvist", initials: "SL", role: "Member", roleColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", avatarColor: "bg-violet-600 text-white" },
  { id: "mem-8", name: "Diego Alvarez", initials: "DA", role: "Member", roleColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", avatarColor: "bg-indigo-600 text-white" },
];

export interface ICreateProjectPayload {
  name: string;
  code: string;
  description?: string;
  phase: string; // ProjectPhase enum string
  priority?: string; // ProjectPriority enum string
  startDate?: string;
  dueDate?: string;
  leadId: string;
  memberIds?: string[];
}

export interface IProjectCardResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  progress?: number;
  status: string;
  statusColor: string;
  memberCount: number;
  dueDate: string;
}

export interface IProjectResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  phase: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  leadId: string;
  progress?: number;
  members?: Array<{ id: string; user: { id: string; firstName: string; lastName?: string; email: string } }>;
  _count?: { members: number };
}

export interface IProjectQuery {
  search?: string;
  phase?: ProjectPhase;
  priority?: ProjectPriority;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: OrderBy | string;
}