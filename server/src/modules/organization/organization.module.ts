import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [RoleModule, UserModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  exports: [OrganizationService, OrganizationRepository]
})
export class OrganizationModule {}
