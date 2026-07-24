import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { UserService } from '../modules/user/user.service';
import { RoleService } from '../role/role.service';
import { TokenService } from '../token/token.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: OrganizationRepository, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: RoleService, useValue: {} },
        { provide: TokenService, useValue: {} },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
