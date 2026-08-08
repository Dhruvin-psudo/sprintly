import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { ProjectTaskController } from './project-task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';

@Module({
  controllers: [TaskController, ProjectTaskController],
  providers: [TaskService, TaskRepository],
  exports: [TaskService, TaskRepository],
})
export class TaskModule {}
