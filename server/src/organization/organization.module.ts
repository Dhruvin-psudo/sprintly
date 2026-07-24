import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { RoleModule } from '../role/role.module';
import { UserModule } from '../modules/user/user.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [RoleModule, UserModule, TokenModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository]
})
export class OrganizationModule {}
