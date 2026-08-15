import { useState, useMemo } from 'react';
import { Bell, Mail, CheckCheck } from 'lucide-react';
import type { InvitationItem } from '@/api/services/invitation.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyPendingInvitations } from '@/features/invitation/hooks/use-my-pending-invitations';
import { usePendingInvitationsModal } from '@/store/pending-invitations-modal-context';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'invitation' | 'system';
  invitationToken?: string;
  orgName?: string;
  inviterName?: string;
}

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [readNotificationIds, setReadNotificationIds] = useState<Record<string, boolean>>({});

  const { invitations } = useMyPendingInvitations();
  const { openModal } = usePendingInvitationsModal();

  // Convert workspace invitations into unified notification items
  const notifications: NotificationItem[] = useMemo(() => {
    return invitations.map((inv: InvitationItem) => {
      const inviterName = inv.invitedByUser
        ? `${inv.invitedByUser.firstName} ${inv.invitedByUser.lastName || ''}`.trim()
        : 'Team Admin';
      const orgName = inv.organization?.name || 'Workspace';

      return {
        id: `inv-${inv.id}`,
        title: `Workspace Invitation`,
        message: `You have been invited to join ${orgName} by ${inviterName}.`,
        isRead: !!readNotificationIds[`inv-${inv.id}`],
        type: 'invitation',
        invitationToken: inv.token || inv.id,
        orgName,
        inviterName,
      };
    });
  }, [invitations, readNotificationIds]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const readCount = useMemo(
    () => notifications.filter((n) => n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((n) => !n.isRead);
    if (activeTab === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAllAsRead = () => {
    const nextMap = { ...readNotificationIds };
    notifications.forEach((n) => {
      nextMap[n.id] = true;
    });
    setReadNotificationIds(nextMap);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    setReadNotificationIds((prev) => ({ ...prev, [notification.id]: true }));

    // If it's an invitation notification, open the invitation dialog
    if (notification.type === 'invitation') {
      setOpen(false);
      openModal();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex items-center justify-center size-9 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground relative transition-colors focus-visible:outline-none cursor-pointer">
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-3 rounded-2xl border border-border shadow-lg bg-popover"
      >
        <div className="flex items-center justify-between px-1 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant='outline' className="bg-primary/10 text-primary border-0 rounded-full text-xs font-semibold px-2 py-0.5">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 cursor-pointer gap-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="size-3.5" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread' | 'read')} className="pt-2">
          <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-md gap-1">
            <TabsTrigger value="all" className="text-xs rounded-md font-medium">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs rounded-md font-medium">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs rounded-md font-medium">
              Read ({readCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-2">
            <ScrollArea className="max-h-80 pr-1">
              {filteredNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground font-normal">
                  No {activeTab === 'all' ? '' : activeTab} notifications
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                        item.isRead
                          ? 'border-border/40 bg-card/40 hover:bg-accent/40'
                          : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
                      }`}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="size-4" />
                      </div>
                      <div className="text-xs space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-foreground truncate">{item.title}</p>
                          {!item.isRead && (
                            <span className="size-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-muted-foreground leading-snug">{item.message}</p>
                        <p className="text-primary font-semibold flex items-center gap-1 hover:underline pt-0.5">
                          Click to respond
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Re-export for backward compatibility
export { NotificationsPopover as PendingInvitationsPopover };
