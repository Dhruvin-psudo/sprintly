import { useState } from "react";
import { Search, Shield, Trash2, UserX } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrgMembers } from "../hooks/use-org-members";
import { useRoles } from "../hooks/use-roles";
import { useCurrentOrganization } from "../../organization/hooks/use-current-organization";
import { useUpdateMemberRole } from "../hooks/use-update-member-role";
import { useRemoveOrgMember } from "../hooks/use-remove-org-member";
import { getRoleBadgeStyle } from "../../../utils/role-style";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { IUser } from "@/features/auth/types";



const ROLE_HIERARCHY_RANK: Record<string, number> = {
  OWNER: 1,
  ADMIN: 2,
  MANAGER: 3,
  LEAD: 3,
  MEMBER: 4,
  VIEWER: 5,
};

const getRoleRank = (roleName?: string): number => {
  const upper = (roleName || "").trim().toUpperCase();
  return ROLE_HIERARCHY_RANK[upper] ?? 99;
};

export function MembersListTable() {
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<{ userId: string; roleId: string; name: string } | null>(null);
  const [deletingUser, setDeletingUser] = useState<{ userId: string; name: string } | null>(null);

  const { data: membersResponse, isLoading, error, refetch } = useOrgMembers({ search });
  const { data: currentOrg } = useCurrentOrganization();
  const { data: currentUser } = useCurrentUser();
  const { data: roles = [] } = useRoles();

  const rawMembers = membersResponse?.data || [];
  const hasOwner = rawMembers.some(
    (m) => m.currentRole?.name?.toUpperCase() === "OWNER"
  );

  const membersList = [...rawMembers];
  if (!hasOwner && currentOrg && !search) {
    const ownerUser: IUser = {
      id: currentOrg.owner?.id || currentOrg.createdBy || "owner-1",
      email: currentOrg.owner?.email || currentOrg.email || "owner@organization.com",
      firstName: currentOrg.owner?.firstName || "Organization",
      lastName: currentOrg.owner?.lastName || "Owner",
      status: "ACTIVE",
      lastLoginAt: null,
      lastActiveOrgId: currentOrg.id,
      createdAt: currentOrg.createdAt || new Date().toISOString(),
      updatedAt: currentOrg.updatedAt || new Date().toISOString(),
      currentRole: { id: "role-owner", name: "Owner", hierarchyLevel: 1 },
    };
    membersList.unshift(ownerUser);
  }

  const members = membersList.sort((a, b) => {
    const rankA = getRoleRank(a.currentRole?.name);
    const rankB = getRoleRank(b.currentRole?.name);
    if (rankA !== rankB) return rankA - rankB;
    return (a.firstName || "").localeCompare(b.firstName || "");
  });

  const updateRoleMutation = useUpdateMemberRole({
    onSuccess: () => setEditingUser(null)
  });

  const removeMemberMutation = useRemoveOrgMember({
    onSuccess: () => setDeletingUser(null)
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 p-6 text-center">
        <p className="text-sm text-destructive">Failed to load organization members.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
      </div>

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <UserX className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium">No members found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase() || "U";
                const fullName = `${member.firstName} ${member.lastName || ""}`.trim();
                const roleName = member.currentRole?.name || "Member";
                const isOwner = roleName.toUpperCase() === "OWNER";
                const isCurrentUser = member.id === currentUser?.id;

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium leading-none">{fullName}</span>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20 font-semibold">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const roleStyle = getRoleBadgeStyle(roleName);
                        return (
                          <Badge variant='outline' className={`${roleStyle.className}`}>
                            {roleStyle.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isOwner && !isCurrentUser && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Change Role"
                            onClick={() =>
                              setEditingUser({
                                userId: member.id,
                                roleId: member.currentRole?.id || "",
                                name: fullName,
                              })
                            }
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            title="Remove Member"
                            onClick={() =>
                              setDeletingUser({
                                userId: member.id,
                                name: fullName,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Role Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
              <DialogDescription>
                Select a new role for <strong>{editingUser.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3">
              {(() => {
                const selectedRoleForEdit = roles.find((r) => r.id === editingUser.roleId);
                return (
                  <Select
                    value={editingUser.roleId}
                    onValueChange={(val) => {
                      if (val) setEditingUser({ ...editingUser, roleId: val });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new role...">
                        {selectedRoleForEdit ? selectedRoleForEdit.name : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter((r) => r.name.toUpperCase() !== "OWNER")
                        .map((role) => (
                          <SelectItem key={role.id} value={role.id} label={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                disabled={updateRoleMutation.isPending}
                onClick={() =>
                  updateRoleMutation.mutate({
                    userId: editingUser.userId,
                    roleId: editingUser.roleId,
                  })
                }
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Remove Member Dialog */}
      {deletingUser && (
        <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Remove Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove <strong>{deletingUser.name}</strong> from this organization?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={removeMemberMutation.isPending}
                onClick={() => removeMemberMutation.mutate(deletingUser.userId)}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
