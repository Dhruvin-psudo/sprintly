import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            isEmailTaken: jest.fn(),
            getByEmail: jest.fn(),
            findById: jest.fn(),
            getWithMembership: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            updateLastActiveOrg: jest.fn(),
            updateLastLoginAt: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(10),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: 'plainPassword123',
      };
      const createdUser = { id: 'u-1', firstName: 'John', email: 'john@example.com' } as any;

      userRepository.isEmailTaken.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: expect.any(String),
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const user = { id: 'u-1', email: 'john@example.com' } as any;
      userRepository.findById.mockResolvedValue(user);

      const result = await service.findById('u-1');
      expect(result).toEqual(user);
    });

    it('should throw error if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(service.findById('invalid-id')).rejects.toThrow('User with id invalid-id not found');
    });
  });

  describe('getMe', () => {
    it('should return user with currentRole hierarchy level', async () => {
      const mockUserWithMembership = {
        id: 'u-1',
        email: 'john@example.com',
        currentRole: { id: 'r-1', name: 'OWNER' },
      } as any;
      userRepository.getWithMembership.mockResolvedValue(mockUserWithMembership);

      const result = await service.getMe('u-1', 'org-1');

      expect(result.currentRole).toEqual({
        id: 'r-1',
        name: 'OWNER',
        hierarchyLevel: 100,
      });
    });

    it('should throw error if user is not found', async () => {
      userRepository.getWithMembership.mockResolvedValue(null);
      await expect(service.getMe('invalid-id', 'org-1')).rejects.toThrow('User with id invalid-id not found');
    });
  });

  describe('changePassword', () => {
    it('should update password if current password is valid', async () => {
      const currentPasswordHash = await bcrypt.hash('oldPass123', 10);
      const mockUser = { id: 'u-1', email: 'john@example.com', passwordHash: currentPasswordHash } as any;

      userRepository.findById.mockResolvedValue({ id: 'u-1', email: 'john@example.com' } as any);
      userRepository.getByEmail.mockResolvedValue(mockUser);

      await service.changePassword('u-1', {
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
      });

      expect(userRepository.update).toHaveBeenCalledWith('u-1', {
        passwordHash: expect.any(String),
      });
    });

    it('should throw error if current password is invalid', async () => {
      const currentPasswordHash = await bcrypt.hash('oldPass123', 10);
      const mockUser = { id: 'u-1', email: 'john@example.com', passwordHash: currentPasswordHash } as any;

      userRepository.findById.mockResolvedValue({ id: 'u-1', email: 'john@example.com' } as any);
      userRepository.getByEmail.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('u-1', {
          currentPassword: 'wrongOldPass',
          newPassword: 'newPass123',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('remove', () => {
    it('should check user existence and soft delete user', async () => {
      userRepository.findById.mockResolvedValue({ id: 'u-1' } as any);

      await service.remove('u-1');

      expect(userRepository.findById).toHaveBeenCalledWith('u-1');
      expect(userRepository.softDelete).toHaveBeenCalledWith('u-1');
    });
  });
});
