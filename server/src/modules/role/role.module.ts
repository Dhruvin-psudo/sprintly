import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  controllers: [RoleController],
  imports: [RealtimeModule],
  providers: [RoleService, RoleRepository],
  exports: [RoleService, RoleRepository]
})
export class RoleModule { }
