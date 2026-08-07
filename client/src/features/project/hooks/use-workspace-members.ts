import { useQuery } from "@tanstack/react-query";
import { MOCK_WORKSPACE_MEMBERS, type WorkspaceMember } from "../types";
import { getAllOrgMembers } from "@/api/services/user.api";
import { getFullName, getInitials } from "@/utils/string";
import type { IUser } from "@/features/auth/types";

export function useWorkspaceMembers() {
  const { data: apiMembers, isLoading, error } = useQuery({
    queryKey: ["workspace-members"],
    queryFn: () => getAllOrgMembers(),
    retry: 1,
  });

  const membersList = apiMembers?.data || (Array.isArray(apiMembers) ? (apiMembers as unknown as IUser[]) : null);

  // Use API members if available, or fallback to workspace mock members
  const allMembers: WorkspaceMember[] = (membersList && Array.isArray(membersList) && membersList.length > 0)
    ? membersList.map((m: IUser & { role?: string }) => {
        const roleName = (m.currentRole?.name || m.role || 'Member') as WorkspaceMember['role'];
        const roleUpper = roleName.toUpperCase();
        return {
          id: m.id,
          name: getFullName(m.firstName, m.lastName) || m.email,
          initials: getInitials(m.firstName, m.lastName) || "U",
          role: roleName,
          roleColor: (roleUpper === 'OWNER')
            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
            : (roleUpper === 'ADMIN')
            ? "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300"
            : (roleUpper === 'MANAGER')
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          avatarColor: "bg-purple-500 text-white",
        };
      })
    : MOCK_WORKSPACE_MEMBERS;

  // Project Lead: Only Owner and Admins
  const leadEligibleMembers = allMembers.filter(
    (m) => m.role.toLowerCase() === "owner" || m.role.toLowerCase() === "admin"
  );

  return {
    allMembers,
    leadEligibleMembers,
    isLoading,
    error,
  };
}
