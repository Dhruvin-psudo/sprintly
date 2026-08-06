import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCurrentOrganization } from "@/features/organization/hooks/use-current-organization";
import { useSwitchOrganization } from "@/features/organization/hooks/use-switch-organization";
import { useOrganizations } from "@/features/organization/hooks/use-organizations";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSwitcher() {
  const { data: currentOrg, isLoading: isLoadingCurrent } = useCurrentOrganization();
  const { data: allOrgs, isLoading: isLoadingAll } = useOrganizations();
  const switchOrg = useSwitchOrganization();

  if (isLoadingCurrent) {
    return (
      <div className="flex items-center gap-2 h-9 px-2">
        <Skeleton className="size-6 rounded-md" />
        <Skeleton className="h-4 w-[140px] rounded-md" />
        <Skeleton className="size-3.5 rounded-sm" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="gap-2 h-9 px-2">
          <div className="grid size-6 place-items-center rounded-md bg-gradient-brand text-xs font-bold text-white">
            {currentOrg?.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium max-w-[140px] truncate">{currentOrg?.name}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
          {isLoadingAll ? (
            <div className="space-y-1.5 p-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-1.5 py-1.5 rounded-md">
                  <Skeleton className="size-6 rounded-md shrink-0" />
                  <Skeleton className="h-4 flex-1 rounded-md" />
                  <Skeleton className="h-4 w-10 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            allOrgs?.map((w) => {
              const isActive = currentOrg?.id === w.id;

              return (
                <DropdownMenuItem key={w.id} className="gap-2" onClick={() => {
                  if (!isActive) switchOrg.mutate(w.id)
                }}>
                  <div className="grid size-6 place-items-center rounded-md bg-muted text-[11px] font-bold">
                    {w.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{w.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{w.plan}</Badge>
                  {isActive && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* {pendingInvites.length > 0 && (
          <>
            <DropdownMenuItem onSelect={() => openInviteDialog()} className="gap-2">
              <Mail className="size-4 text-primary" />
              <span className="text-sm">Pending invites</span>
              <Badge className="ml-auto text-[10px]">{pendingInvites.length}</Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )} */}
        <DropdownMenuItem onSelect={() => toast.success("Workspace creation coming soon")}>
          <Plus className="size-4" /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}