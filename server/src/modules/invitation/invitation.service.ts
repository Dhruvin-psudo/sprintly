import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { InvitationRepository } from './invitation.repository';
import { UserRepository } from '../user/user.repository';
import { RoleRepository } from '../role/role.repository';
import { TokenService } from '../token/token.service';
import { MailService } from '../mail/mail.service';
import { SendInvitationDto, AcceptInvitationDto, InvitationQueryDto } from './dto';
import { IAuthenticatedUser } from '../../common/interfaces';
import { ResourceNotFoundException, ValidationFailedException } from '../../common/errors';
import { InvitationStatus } from '@prisma/client';
import { SystemRole } from '../../common/constants';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async sendInvitation(dto: SendInvitationDto, caller: IAuthenticatedUser) {
    // 1. Gather and normalize emails
    let emailsList: string[] = [];
    if (dto.emails && Array.isArray(dto.emails)) {
      emailsList = dto.emails;
    } else if (dto.email) {
      emailsList = dto.email.split(/[\n,]/).map((e) => e.trim()).filter(Boolean);
    }

    emailsList = Array.from(new Set(emailsList.map((e) => e.toLowerCase().trim()))).filter((e) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
    );

    if (emailsList.length === 0) {
      throw new ValidationFailedException({
        email: ['Please provide at least one valid email address.'],
      });
    }

    // 2. Validate role
    const role = await this.roleRepository.findRoleWithPermissions(dto.roleId, caller.organizationId);
    if (!role) {
      throw new ResourceNotFoundException('Role', dto.roleId);
    }

    if (role.name.toUpperCase() === SystemRole.OWNER) {
      throw new ValidationFailedException({
        roleId: ['Cannot invite users as Organization Owner.'],
      });
    }

    // 3. Fetch inviter and org info for email template
    const inviter = await this.userRepository.findById(caller.userId);
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName || ''}`.trim() : 'Team Admin';
    const org = await this.invitationRepository.getOrganizationById(caller.organizationId);
    const orgName = org?.name || 'Sprintly Organization';

    const sentInvitations: unknown[] = [];
    const errors: Array<{ email: string; message: string }> = [];

    // 4. Process each email
    for (const email of emailsList) {
      try {
        const isOrgMember = await this.invitationRepository.isUserActiveOrgMember(
          caller.organizationId,
          email,
        );
        if (isOrgMember) {
          errors.push({ email, message: 'Already an active organization member.' });
          continue;
        }

        const pendingInv = await this.invitationRepository.findPendingByEmail(
          caller.organizationId,
          email,
        );
        if (pendingInv) {
          errors.push({ email, message: 'An active pending invitation already exists.' });
          continue;
        }

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invitation = await this.invitationRepository.create({
          organizationId: caller.organizationId,
          email,
          roleId: dto.roleId,
          token,
          expiresAt,
          invitedById: caller.userId,
        });

        const invitedUser = await this.userRepository.getByEmail(email);
        if (invitedUser) this.realtimeService.invitationChanged(invitedUser.id);
        this.realtimeService.organizationChanged(caller.organizationId, 'invitations');

        await this.mailService.sendInvitationEmail({
          to: email,
          inviterName,
          orgName,
          roleName: role.name,
          token,
        });

        const { token: _invitationToken, ...safeInvitation } = invitation;
        sentInvitations.push(safeInvitation);
        this.logger.log({ email, orgId: caller.organizationId }, 'Organization invitation sent');
      } catch (err: unknown) {
        this.logger.error({ email, err: err instanceof Error ? err.message : String(err) }, 'Error processing invitation');
        errors.push({ email, message: 'Internal error processing invitation.' });
      }
    }

    if (sentInvitations.length === 0 && errors.length > 0) {
      throw new ValidationFailedException({
        email: [errors[0].message],
      });
    }

    const message =
      emailsList.length > 1
        ? `Sent ${sentInvitations.length} invitation(s).`
        : 'Invitation sent successfully.';

    return {
      sentCount: sentInvitations.length,
      errorsCount: errors.length,
      sentInvitations,
      errors,
      message,
    };
  }

  async verifyToken(token: string) {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new ValidationFailedException({
        token: ['Invalid or expired invitation link.'],
      });
    }

    if (new Date() > invitation.expiresAt) {
      await this.invitationRepository.updateStatus(invitation.id, InvitationStatus.EXPIRED);
      throw new ValidationFailedException({
        token: ['Invitation link has expired.'],
      });
    }

    // Check if the invited email belongs to a registered user
    const existingUser = await this.userRepository.getByEmail(invitation.email);

    return {
      id: invitation.id,
      email: invitation.email,
      organization: invitation.organization,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      inviter: invitation.invitedByUser,
      isRegistered: !!existingUser,
    };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    await this.verifyToken(dto.token);
    const invitation = await this.invitationRepository.findByToken(dto.token);
    if (!invitation) {
      throw new ValidationFailedException({ token: ['Invitation not found.'] });
    }

    const email = invitation.email.toLowerCase().trim();
    const user = await this.userRepository.getByEmail(email);

    if (user) {
      // Existing registered user — add to org
      const isOrgMember = await this.invitationRepository.isUserActiveOrgMember(
        invitation.organizationId,
        email,
      );
      if (!isOrgMember) {
        await this.roleRepository.createMember(
          {
            userId: user.id,
            organizationId: invitation.organizationId,
            roleId: invitation.roleId,
          },
          invitation.invitedById,
        );
      }

      await this.userRepository.updateLastActiveOrg(user.id, invitation.organizationId);
      await this.invitationRepository.updateStatus(invitation.id, InvitationStatus.ACCEPTED);
      this.realtimeService.organizationChanged(invitation.organizationId, 'members-and-invitations');
      this.realtimeService.invitationChanged(user.id);

      await this.tokenService.revokeAllUserSessions(user.id);
      const { accessToken, refreshToken } = await this.tokenService.generateAuthTokens(user.id, {
        organizationId: invitation.organizationId,
        roleId: invitation.roleId,
      });

      const { passwordHash: _hash, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, accessToken, refreshToken, hasOrganization: true };
    }

    // New user — must provide firstName and password
    if (!dto.firstName || !dto.password) {
      throw new ValidationFailedException({
        password: ['First name and password are required to create an account.'],
      });
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName ?? '',
      email,
      passwordHash,
    });

    await this.roleRepository.createMember(
      {
        userId: newUser.id,
        organizationId: invitation.organizationId,
        roleId: invitation.roleId,
      },
      invitation.invitedById,
    );

    await this.userRepository.updateLastActiveOrg(newUser.id, invitation.organizationId);
    await this.invitationRepository.updateStatus(invitation.id, InvitationStatus.ACCEPTED);
    this.realtimeService.organizationChanged(invitation.organizationId, 'members-and-invitations');

    const { accessToken, refreshToken } = await this.tokenService.generateAuthTokens(newUser.id, {
      organizationId: invitation.organizationId,
      roleId: invitation.roleId,
    });

    return { user: newUser, accessToken, refreshToken, hasOrganization: true };
  }

  async getInvitations(caller: IAuthenticatedUser, query: InvitationQueryDto) {
    return this.invitationRepository.findMany(caller.organizationId, query);
  }

  async revokeInvitation(id: string, caller: IAuthenticatedUser) {
    const existing = await this.invitationRepository.findById(id, caller.organizationId);
    if (!existing) {
      throw new ResourceNotFoundException('Invitation', id);
    }

    await this.invitationRepository.updateStatus(id, InvitationStatus.REVOKED);
    this.realtimeService.organizationChanged(caller.organizationId, 'invitations');
    const revokedInvitee = await this.userRepository.getByEmail(existing.email);
    if (revokedInvitee) this.realtimeService.invitationChanged(revokedInvitee.id);
    return { message: 'Invitation revoked successfully.' };
  }

  async resendInvitation(id: string, caller: IAuthenticatedUser) {
    const existing = await this.invitationRepository.findById(id, caller.organizationId);
    if (!existing) {
      throw new ResourceNotFoundException('Invitation', id);
    }

    if (existing.status !== InvitationStatus.PENDING && existing.status !== InvitationStatus.EXPIRED) {
      throw new ValidationFailedException({
        id: ['Only pending or expired invitations can be resent.'],
      });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await this.invitationRepository.updateTokenAndExpiration(id, token, expiresAt);
    this.realtimeService.organizationChanged(caller.organizationId, 'invitations');
    const resentInvitee = await this.userRepository.getByEmail(existing.email);
    if (resentInvitee) this.realtimeService.invitationChanged(resentInvitee.id);

    const inviter = await this.userRepository.findById(caller.userId);
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName || ''}`.trim() : 'Team Admin';
    const org = await this.invitationRepository.getOrganizationById(caller.organizationId);

    await this.mailService.sendInvitationEmail({
      to: existing.email,
      inviterName,
      orgName: org?.name || 'Sprintly Organization',
      roleName: existing.role.name,
      token,
    });

    const { token: _updatedToken, ...safeInvitation } = updated;
    return { invitation: safeInvitation, message: 'Invitation link resent successfully.' };
  }

  async declineInvitation(token: string) {
    const invitation = await this.verifyToken(token);
    await this.invitationRepository.updateStatusByToken(token, InvitationStatus.DECLINED);
    this.realtimeService.organizationChanged(invitation.organization.id, 'invitations');
    const invitedUser = await this.userRepository.getByEmail(invitation.email);
    if (invitedUser) this.realtimeService.invitationChanged(invitedUser.id);
    return { message: 'Invitation declined successfully.' };
  }

  async getMyPendingInvitations(caller: IAuthenticatedUser) {
    const user = await this.userRepository.findById(caller.userId);
    if (!user) {
      return [];
    }
    return this.invitationRepository.findPendingByEmailForUser(user.email);
  }

  async acceptInvitationForUser(id: string, caller: IAuthenticatedUser) {
    const user = await this.userRepository.findById(caller.userId);
    if (!user) throw new ResourceNotFoundException('User', caller.userId);
    const invitation = await this.invitationRepository.findPendingByIdForUser(id, user.email);
    if (!invitation) throw new ResourceNotFoundException('Invitation', id);
    const result = await this.acceptInvitation({ token: invitation.token });
    return result;
  }

  async declineInvitationForUser(id: string, caller: IAuthenticatedUser) {
    const user = await this.userRepository.findById(caller.userId);
    if (!user) throw new ResourceNotFoundException('User', caller.userId);
    const invitation = await this.invitationRepository.findPendingByIdForUser(id, user.email);
    if (!invitation) throw new ResourceNotFoundException('Invitation', id);
    await this.invitationRepository.updateStatus(id, InvitationStatus.DECLINED);
    this.realtimeService.organizationChanged(invitation.organizationId, 'invitations');
    this.realtimeService.invitationChanged(caller.userId);
    return { message: 'Invitation declined successfully.' };
  }
}
