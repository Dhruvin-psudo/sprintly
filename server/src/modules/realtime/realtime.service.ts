import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway, realtimeRooms } from './realtime.gateway';
import { PrismaService } from '../../prisma';

export type OrganizationChangeSubject =
  | 'members'
  | 'invitations'
  | 'members-and-invitations';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(
    private readonly gateway: RealtimeGateway,
    private readonly prisma: PrismaService,
  ) {}

  async organizationChanged(organizationId: string, subject: OrganizationChangeSubject): Promise<void> {
    try {
      if (!this.gateway.server) return;

      const members = await this.prisma.organizationMember.findMany({
        where: { organizationId },
        select: { userId: true },
      });

      const payload = { organizationId, subject };

      for (const member of members) {
        try {
          this.gateway.server.to(realtimeRooms.user(member.userId)).emit('organization.changed', payload);
        } catch (error: unknown) {
          this.logger.warn(
            `Organization realtime event failed for user ${member.userId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to fan out organization.changed event for org ${organizationId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  invitationChanged(userId: string): void {
    try {
      this.gateway.server?.to(realtimeRooms.user(userId)).emit('invitations.changed');
    } catch (error) {
      this.logger.error(
        `Failed to emit invitations.changed event for user ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  membershipChanged(userId: string, organizationId: string, reason: 'removed' | 'role-changed'): void {
    try {
      this.gateway.server?.to(realtimeRooms.user(userId)).emit('membership.changed', {
        organizationId,
        reason,
      });
    } catch (error) {
      this.logger.error(
        `Failed to emit membership.changed event for user ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
