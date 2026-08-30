import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { LogOut, User, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PRIVATE_ROUTES } from "@/router/constants/routes";
import { WorkspaceSwitcher } from "./components/workspace-switcher";
import { NotificationsPopover } from "./components/notifications-popover";
import type { IUser } from "@/features/auth/types";
import { getFullName, getInitials } from "@/utils/string";
import { useLogout } from "@/features/auth/hooks/use-logout";

interface AppHeaderProps {
  user?: IUser;
}

export function AppHeader({ user }: AppHeaderProps) {
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const userInitials = getInitials(user?.firstName, user?.lastName) || "U";
  const userFullName = getFullName(user?.firstName, user?.lastName) || "User";

  return (
    <header className="h-16 border-b border-border/80 bg-card/50 backdrop-blur-xl shrink-0 z-40 flex items-center justify-between px-6">
      {/* Workspace Switcher Placeholder - for now it matches UI */}
      <div className="hidden md:block">
        <WorkspaceSwitcher />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        <NotificationsPopover />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="gap-2 h-9 px-2 rounded-lg cursor-pointer">
              <Avatar className="size-7">
                <AvatarFallback className="bg-gradient-brand text-white text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.firstName || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 border border-border shadow-lg bg-popover rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none text-foreground">{userFullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => navigate(`${PRIVATE_ROUTES.SETTINGS}?tab=profile`)}
                className="gap-2.5 px-2.5 py-2 text-sm font-medium rounded-md cursor-pointer"
              >
                <User className="size-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`${PRIVATE_ROUTES.SETTINGS}?tab=organization`)}
                className="gap-2.5 px-2.5 py-2 text-sm font-medium rounded-md cursor-pointer"
              >
                <Building2 className="size-4 text-muted-foreground" />
                <span>Organization</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                className="gap-2.5 px-2.5 py-2 text-sm font-medium rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="size-4 text-destructive" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
