import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { PrismaModule } from '../../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
