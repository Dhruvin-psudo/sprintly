import { useState } from "react";
import { UserPlus, Users, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MembersListTable } from "@/features/user/components/members-list-table";
import { PendingInvitationsTable } from "@/features/user/components/pending-invitations-table";
import { InviteMemberDialog } from "@/features/invitation/components/invite-member-dialog";

export function MembersPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your organization members, assign roles, and invite colleagues.
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)} className="gap-2 self-start sm:self-auto text-white">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 gap-1">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Active Members
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="h-4 w-4" />
            Pending Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-0">
          <MembersListTable />
        </TabsContent>

        <TabsContent value="invitations" className="mt-0">
          <PendingInvitationsTable />
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}
