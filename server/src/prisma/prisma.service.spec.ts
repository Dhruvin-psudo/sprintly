import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    jest.spyOn(service, '$connect').mockImplementation(async () => {});
    jest.spyOn(service, '$disconnect').mockImplementation(async () => {});
    jest.spyOn(service, '$executeRaw').mockImplementation((async () => 1) as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      await service.onModuleInit();
      expect(service.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      await service.onModuleDestroy();
      expect(service.$disconnect).toHaveBeenCalled();
    });
  });

  describe('setTenantContext', () => {
    it('should set tenant context when orgId and userId are provided', async () => {
      await service.setTenantContext('org-123', 'user-456');
      expect(service.$executeRaw).toHaveBeenCalledTimes(2);
    });

    it('should set default empty tenant context when parameters are missing', async () => {
      await service.setTenantContext();
      expect(service.$executeRaw).toHaveBeenCalledTimes(2);
    });
  });
});
