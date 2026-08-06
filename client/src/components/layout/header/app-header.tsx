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
import { Bell, LogOut } from "lucide-react";
import { WorkspaceSwitcher } from "./components/workspace-switcher";
import type { IUser } from "@/features/auth/types";
import { getFullName, getInitials } from "@/utils/string";
import { useLogout } from "@/features/auth/hooks/use-logout";

interface AppHeaderProps {
  user: IUser;
}

export function AppHeader({ user }: AppHeaderProps) {
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
        
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger >
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="size-7">
                <AvatarFallback className="bg-gradient-brand text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.firstName || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{userFullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
