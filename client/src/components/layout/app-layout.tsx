import { Outlet } from "react-router-dom";
import { AppSidebar } from "./sidebar/app-sidebar";
import { AppHeader } from "./header/app-header";

export function AppLayout() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
