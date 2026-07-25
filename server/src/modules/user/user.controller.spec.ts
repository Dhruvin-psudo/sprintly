import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getMe: jest.fn(),
            changePassword: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return current user with role hierarchy level', async () => {
      const mockUser = {
        id: 'u-1',
        email: 'john@example.com',
        currentRole: { id: 'r-1', name: 'OWNER', hierarchyLevel: 100 },
      } as any;
      userService.getMe.mockResolvedValue(mockUser);

      const response = await controller.getMe('u-1', 'org-1');

      expect(userService.getMe).toHaveBeenCalledWith('u-1', 'org-1');
      expect(response.data).toEqual(mockUser);
      expect(response.message).toBe('User fetched successfully');
    });
  });

  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      const changeDto = { currentPassword: 'oldPass123', newPassword: 'newPass123' };
      const response = await controller.changePassword('u-1', changeDto);

      expect(userService.changePassword).toHaveBeenCalledWith('u-1', changeDto);
      expect(response.data).toBeNull();
      expect(response.message).toBe('Password changed successfully');
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      const response = await controller.remove('u-1');

      expect(userService.remove).toHaveBeenCalledWith('u-1');
      expect(response.data).toBeNull();
      expect(response.message).toBe('User deleted successfully');
    });
  });
});
