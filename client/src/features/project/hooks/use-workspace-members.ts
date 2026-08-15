import { useQuery } from "@tanstack/react-query";
import { MOCK_WORKSPACE_MEMBERS, type WorkspaceMember } from "../types";
import { getAllOrgMembers } from "@/api/services/user.api";
import { useCurrentOrganization } from "@/features/organization/hooks/use-current-organization";
import { getFullName, getInitials } from "@/utils/string";
import { getRoleBadgeStyle } from "@/utils/role-style";
import type { IUser } from "@/features/auth/types";

export function useWorkspaceMembers() {
  const { data: apiMembers, isLoading, error } = useQuery({
    queryKey: ["workspace-members"],
    queryFn: () => getAllOrgMembers(),
    retry: 1,
  });
  const { data: currentOrg } = useCurrentOrganization();

  const membersList = apiMembers?.data || (Array.isArray(apiMembers) ? (apiMembers as unknown as IUser[]) : null);

  // Use API members if available, or fallback to workspace mock members
  let allMembers: WorkspaceMember[] = (membersList && Array.isArray(membersList) && membersList.length > 0)
    ? membersList.map((m: IUser & { role?: string }) => {
        const roleName = (m.currentRole?.name || m.role || 'Member') as WorkspaceMember['role'];
        const roleStyle = getRoleBadgeStyle(roleName);
        return {
          id: m.id,
          name: getFullName(m.firstName, m.lastName) || m.email,
          initials: getInitials(m.firstName, m.lastName) || "U",
          role: roleName,
          roleColor: roleStyle.className,
          avatarColor: "bg-purple-500 text-white",
        };
      })
    : MOCK_WORKSPACE_MEMBERS;

  // Check if an Owner member exists in allMembers
  const hasOwner = allMembers.some((m) => m.role.toUpperCase() === "OWNER");
  if (!hasOwner && currentOrg) {
    const ownerName = currentOrg.owner
      ? getFullName(currentOrg.owner.firstName, currentOrg.owner.lastName)
      : "Organization Owner";
    const ownerInitials = currentOrg.owner
      ? getInitials(currentOrg.owner.firstName, currentOrg.owner.lastName)
      : "OW";
    const ownerStyle = getRoleBadgeStyle("Owner");
    const ownerMember: WorkspaceMember = {
      id: currentOrg.owner?.id || currentOrg.createdBy || "owner-1",
      name: ownerName,
      initials: ownerInitials,
      role: "Owner",
      roleColor: ownerStyle.className,
      avatarColor: "bg-purple-500 text-white",
    };
    allMembers = [ownerMember, ...allMembers];
  }

  // Project Lead: Owner and Admins (or all members as fallback)
  const leadEligibleMembers = allMembers.filter(
    (m) => m.role.toUpperCase() === "OWNER" || m.role.toUpperCase() === "ADMIN"
  );
  const finalLeadEligible = leadEligibleMembers.length > 0 ? leadEligibleMembers : allMembers;

  return {
    allMembers,
    leadEligibleMembers: finalLeadEligible,
    isLoading,
    error,
  };
}
