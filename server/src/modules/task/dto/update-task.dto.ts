import { TaskPriority, TaskStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Title cannot be empty' })
    @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
    description?: string;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() as TaskStatus : value))
    @IsEnum(TaskStatus, { message: 'Invalid task status' })
    status?: TaskStatus;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() as TaskPriority : value))
    @IsEnum(TaskPriority, { message: 'Invalid task priority' })
    priority?: TaskPriority;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'dueDate must be a valid date' })
    dueDate?: Date;

    @IsOptional()
    @IsUUID('4', { message: 'assigneeId must be a valid UUID' })
    assigneeId?: string;
}
