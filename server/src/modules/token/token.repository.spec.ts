import { Test, TestingModule } from '@nestjs/testing';
import { TokenRepository } from './token.repository';
import { PrismaService } from '../prisma';

describe('TokenRepository', () => {
  let repository: TokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepository,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    repository = module.get<TokenRepository>(TokenRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
