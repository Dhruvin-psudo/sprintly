import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function WorkspaceSwitcher() {
//   const {
//     workspaces,
//     activeWorkspace,
//     setActiveWorkspace,
//     pendingInvites,
//     openInviteDialog,
//   } = useWorkspace();

const workspaces = [
    {
        id: "001",
        name: "Nebula Studio",
        initial: "N",
        plan: "Free"
    },
    {
        id: "002",
        name: "Acme Inc",
        initial: "A",
        plan: "Pro"
    },
    {
        id: "003",
        name: "Beta Corp",
        initial: "B",
        plan: "Enterprise"
    }
];

const activeWorkspace = {
    id: "001",
    name: "Nebula Studio",
    initial: "N",
    plan: "Free"
}

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="gap-2 h-9 px-2">
          <div className="grid size-6 place-items-center rounded-md bg-gradient-brand text-[11px] font-bold text-white">
            {/* {activeWorkspace.initial} */} N
          </div>
          <span className="text-sm font-medium max-w-[140px] truncate">{activeWorkspace.name}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} className="gap-2">
            <div className="grid size-6 place-items-center rounded-md bg-muted text-[11px] font-bold">
              {w.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{w.name}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">{w.plan}</Badge>
            {activeWorkspace.id === w.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
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