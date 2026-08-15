import { Outlet } from "react-router-dom";
import { AppSidebar } from "./sidebar/app-sidebar";
import { AppHeader } from "./header/app-header";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { AcceptInviteModal } from "@/features/invitation/components/accept-invite-modal";
import { PendingInvitationsModalProvider } from "@/store/pending-invitations-modal-context";
import { PendingInvitationsDialog } from "@/features/invitation/components/pending-invitations-dialog";

export function AppLayout() {
  const { data: user } = useCurrentUser();

  return (
    <PendingInvitationsModalProvider>
      <div className="flex h-svh w-full overflow-hidden bg-background text-foreground">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader user={user}/>
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
        <AcceptInviteModal />
        <PendingInvitationsDialog />
      </div>
    </PendingInvitationsModalProvider>
  );
}

