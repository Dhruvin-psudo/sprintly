import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, LogOut } from "lucide-react";
import { clearAccessToken } from "@/api";
import { useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/router/constants/routes";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "./components/workspace-switcher";

export function AppHeader() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAccessToken();
    toast.info("Logged out successfully");
    navigate(PUBLIC_ROUTES.LOGIN);
  }

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
            <Button variant="ghost" className="gap-2 pl-2 pr-3 py-5">
              <Avatar className="size-7">
                <AvatarFallback className="bg-gradient-brand text-white text-xs">AM</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">Ava</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Ava Mitchell</p>
                <p className="text-xs leading-none text-muted-foreground">
                  ava@nebulastudio.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
