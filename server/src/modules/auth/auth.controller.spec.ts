import { Test, TestingModule } from '@nestjs/testing';
import { AuthContoller } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';

describe('AuthContoller', () => {
  let controller: AuthContoller;
  let authService: AuthService;

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthContoller],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(7),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthContoller>(AuthContoller);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and set refresh cookie if returned', async () => {
      const registerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        passwordHash: 'password123',
      };
      const result = {
        user: { id: 'u-1', email: 'john@example.com' } as any,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      (authService.register as jest.Mock).mockResolvedValue(result);

      const res = mockResponse();
      const response = await controller.register(registerDto, res);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({ path: '/auth' })
      );
      expect(response.data).toEqual({
        user: result.user,
        accessToken: result.accessToken,
      });
    });
  });

  describe('login', () => {
    it('should login a user and set refresh cookie', async () => {
      const loginDto = { email: 'john@example.com', password: 'password123' };
      const result = {
        user: { id: 'u-1', email: 'john@example.com' } as any,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      (authService.login as jest.Mock).mockResolvedValue(result);

      const res = mockResponse();
      const response = await controller.login(loginDto, res);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).toHaveBeenCalled();
      expect(response.data).toEqual({
        user: result.user,
        accessToken: result.accessToken,
      });
    });
  });

  describe('logout', () => {
    it('should logout user and clear refresh token cookie', async () => {
      const res = mockResponse();
      const response = await controller.logout('token-id-123', res);

      expect(authService.logout).toHaveBeenCalledWith('token-id-123');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.objectContaining({ path: '/auth' }));
      expect(response.data).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should throw Error if refresh token cookie is missing', async () => {
      const req = { cookies: {} } as Request;
      await expect(controller.refresh(req)).rejects.toThrow('Refresh token not found');
    });

    it('should refresh access token when refresh cookie exists', async () => {
      const req = { cookies: { refreshToken: 'valid-token' } } as unknown as Request;
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({ accessToken: 'new-access-token' });

      const response = await controller.refresh(req);
      expect(authService.refreshAccessToken).toHaveBeenCalledWith('valid-token');
      expect(response.data).toEqual({ accessToken: 'new-access-token' });
    });
  });
});
