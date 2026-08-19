import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway, realtimeRooms } from './realtime.gateway';
import { PrismaService } from '../../prisma';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let mockGateway: Partial<RealtimeGateway>;
  let mockPrisma: Partial<PrismaService>;
  let emitMock: jest.Mock;
  let toMock: jest.Mock;

  beforeEach(async () => {
    emitMock = jest.fn();
    toMock = jest.fn().mockReturnValue({ emit: emitMock });

    mockGateway = {
      server: {
        to: toMock,
      } as any,
    };

    mockPrisma = {
      organizationMember: {
        findMany: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeService,
        { provide: RealtimeGateway, useValue: mockGateway },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('organizationChanged', () => {
    it('should fan out token-free organization.changed payload to every current member user room', async () => {
      const mockMembers = [{ userId: 'user-1' }, { userId: 'user-2' }, { userId: 'user-3' }];
      (mockPrisma.organizationMember?.findMany as jest.Mock).mockResolvedValue(mockMembers);

      await service.organizationChanged('org-100', 'members');

      expect(mockPrisma.organizationMember?.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-100' },
        select: { userId: true },
      });

      expect(toMock).toHaveBeenCalledWith(realtimeRooms.user('user-1'));
      expect(toMock).toHaveBeenCalledWith(realtimeRooms.user('user-2'));
      expect(toMock).toHaveBeenCalledWith(realtimeRooms.user('user-3'));
      expect(emitMock).toHaveBeenCalledWith('organization.changed', {
        organizationId: 'org-100',
        subject: 'members',
      });
    });

    it('supports a single combined subject for member and invitation changes', async () => {
      (mockPrisma.organizationMember?.findMany as jest.Mock).mockResolvedValue([{ userId: 'user-1' }]);

      await service.organizationChanged('org-100', 'members-and-invitations');

      expect(emitMock).toHaveBeenCalledWith('organization.changed', {
        organizationId: 'org-100',
        subject: 'members-and-invitations',
      });
    });

    it('should safely swallow error if member query or emission fails', async () => {
      (mockPrisma.organizationMember?.findMany as jest.Mock).mockRejectedValue(new Error('DB Connection error'));

      await expect(service.organizationChanged('org-100', 'invitations')).resolves.not.toThrow();
    });
  });

  describe('invitationChanged', () => {
    it('should emit invitations.changed to the invitee user room', () => {
      service.invitationChanged('user-invitee');

      expect(toMock).toHaveBeenCalledWith(realtimeRooms.user('user-invitee'));
      expect(emitMock).toHaveBeenCalledWith('invitations.changed');
    });
  });

  describe('membershipChanged', () => {
    it('should emit membership.changed with organizationId and reason to user room', () => {
      service.membershipChanged('user-1', 'org-100', 'role-changed');

      expect(toMock).toHaveBeenCalledWith(realtimeRooms.user('user-1'));
      expect(emitMock).toHaveBeenCalledWith('membership.changed', {
        organizationId: 'org-100',
        reason: 'role-changed',
      });
    });
  });
});
