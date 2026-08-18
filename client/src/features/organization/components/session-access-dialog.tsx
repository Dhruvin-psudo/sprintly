import { Building2, ArrowRight } from 'lucide-react';
import type { IOrganization } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SessionAccessDialogProps {
  open: boolean;
  organizations: IOrganization[];
  isPending: boolean;
  onSelect: (organizationId: string) => void;
}

export function SessionAccessDialog({ open, organizations, isPending, onSelect }: SessionAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg border-border/80 bg-background p-0 overflow-hidden">
        <div className="border-b border-border/70 bg-muted/30 px-6 py-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Workspace access updated
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl tracking-tight">You were removed from this workspace</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Your account is safe. Choose another workspace to continue where you left off.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-2 px-6 py-5">
          {organizations.map((organization) => (
            <Button
              key={organization.id}
              variant="outline"
              className="h-auto w-full justify-between gap-4 rounded-xl border-border/80 px-4 py-3 text-left hover:border-primary/50 hover:bg-primary/[0.04]"
              disabled={isPending}
              onClick={() => onSelect(organization.id)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{organization.name}</span>
                  <Badge variant="outline" className="mt-1 text-[10px] font-normal">{organization.slug}</Badge>
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
