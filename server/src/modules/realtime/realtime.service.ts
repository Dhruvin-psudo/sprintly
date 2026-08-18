import { Injectable } from '@nestjs/common';
import { RealtimeGateway, realtimeRooms } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  organizationChanged(organizationId: string, subject: 'members' | 'invitations'): void {
    this.gateway.server?.to(realtimeRooms.organization(organizationId)).emit('organization.changed', { subject });
  }

  invitationChanged(userId: string): void {
    this.gateway.server?.to(realtimeRooms.user(userId)).emit('invitations.changed');
  }

  membershipChanged(userId: string, organizationId: string, reason: 'removed' | 'role-changed'): void {
    this.gateway.server?.to(realtimeRooms.user(userId)).emit('membership.changed', {
      organizationId,
      reason,
    });
  }
}
