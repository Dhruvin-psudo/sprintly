import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getFullName, getInitials } from "@/utils/string";
import { calculateWorkload } from "@/features/project/utils/calculate-workload";
import { useRemoveProjectMember } from "@/features/project/hooks/use-remove-project-member";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useCurrentOrganization } from "@/features/organization/hooks/use-current-organization";
import { AddMemberDialog } from "@/features/project/components/project-detail/add-member-dialog";
import { RemoveMemberConfirmDialog } from "@/features/project/components/project-detail/remove-member-confirm-dialog";
import { ProjectMembersSkeleton } from "@/features/project/components/project-detail/project-detail-skeleton";
import type { IProjectResponse } from "@/features/project/types";
import type { Task } from "@/features/task/types";
import { Trash2, UserPlus, Users } from "lucide-react";

interface ProjectMembersTabProps {
  project: IProjectResponse;
  tasks: Task[];
  isLoading?: boolean;
}

export function ProjectMembersTab({ project, tasks, isLoading }: ProjectMembersTabProps) {
  const { data: currentUser } = useCurrentUser();
  const { data: currentOrg } = useCurrentOrganization();
  const removeMemberMutation = useRemoveProjectMember(project.id);
  const members = project.members || [];

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string; email: string } | null>(null);

  if (isLoading) {
    return <ProjectMembersSkeleton />;
  }

  const existingMemberUserIds = members.map((m) => m.user?.id).filter(Boolean) as string[];

  const canRemoveMember = (userId?: string) => {
    if (!userId) return false;
    const isLead = userId === project.leadId;
    const isOwner = currentOrg?.owner?.id ? userId === currentOrg.owner.id : userId === currentOrg?.createdBy;
    const isSelf = userId === currentUser?.id;
    return !isLead && !isOwner && !isSelf;
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(memberToRemove.id, {
      onSuccess: () => {
        setMemberToRemove(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Member Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Project members</h2>
          <p className="text-xs text-muted-foreground">People who are currently part of this project.</p>
        </div>
        <Button
          onClick={() => setIsAddMemberOpen(true)}
          className="bg-gradient-brand text-white hover:opacity-90 shadow-glow"
        >
          <UserPlus className="size-4 mr-1.5" aria-hidden /> Add member
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <dt className="text-xs text-muted-foreground">Total project members</dt>
          <dd className="mt-1 text-2xl font-bold tracking-tight">{members.length || 1}</dd>
        </div>
      </div>

      {/* Table / List View */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="size-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-sm">No members found</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <ul className="divide-y divide-border/60 lg:hidden">
              {members.map((m) => {
                const user = m.user;
                const name = user ? getFullName(user.firstName, user.lastName) : "Unknown Member";
                const email = user?.email || "";
                const initials = user ? getInitials(user.firstName, user.lastName) : "M";
                const workload = calculateWorkload(user?.id || "", tasks);
                const showRemoveBtn = user ? canRemoveMember(user.id) : false;

                return (
                  <li key={m.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-gradient-brand text-white text-[11px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">{email}</p>
                        </div>
                      </div>

                      {showRemoveBtn && user && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => setMemberToRemove({ id: user.id, name, email })}
                              className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Remove from project</span>
                            </TooltipTrigger>
                            <TooltipContent side="top">Remove from project</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress value={workload} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">{workload}% workload</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="text-left p-3 font-medium">Name</th>
                    <th scope="col" className="text-left p-3 font-medium">Email</th>
                    <th scope="col" className="text-left p-3 font-medium">Status</th>
                    <th scope="col" className="text-left p-3 font-medium w-[200px]">Workload</th>
                    <th scope="col" className="p-3 w-10"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const user = m.user;
                    const name = user ? getFullName(user.firstName, user.lastName) : "Unknown Member";
                    const email = user?.email || "";
                    const initials = user ? getInitials(user.firstName, user.lastName) : "M";
                    const workload = calculateWorkload(user?.id || "", tasks);
                    const showRemoveBtn = user ? canRemoveMember(user.id) : false;

                    return (
                      <tr key={m.id} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 shrink-0">
                              <AvatarFallback className="bg-gradient-brand text-white text-[10px] font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span>{name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{email}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            Active
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={workload} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{workload}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          {showRemoveBtn && user && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger
                                  onClick={() => setMemberToRemove({ id: user.id, name, email })}
                                  className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer ml-auto"
                                >
                                  <Trash2 className="size-4" />
                                  <span className="sr-only">Remove from project</span>
                                </TooltipTrigger>
                                <TooltipContent side="top">Remove from project</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        projectId={project.id}
        existingMemberUserIds={existingMemberUserIds}
      />

      {/* Remove Member Confirmation Dialog */}
      <RemoveMemberConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
        memberName={memberToRemove?.name || ""}
        memberEmail={memberToRemove?.email}
        onConfirm={handleConfirmRemove}
        isPending={removeMemberMutation.isPending}
      />
    </div>
  );
}
