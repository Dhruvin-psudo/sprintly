import { TaskPriority, TaskStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto";
import { SortOrder } from "../../../common/constants";

export class TaskQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID('4')
    projectId?: string;

    @IsOptional()
    @IsUUID('4')
    assigneeId?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    myTasksOnly?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() as TaskStatus : value))
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() as TaskPriority : value))
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsIn(['createdAt', 'title', 'status', 'priority', 'dueDate'])
    sortBy?: 'createdAt' | 'title' | 'status' | 'priority' | 'dueDate';

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() as SortOrder : value))
    @IsIn(['asc', 'desc'])
    sortOrder?: SortOrder;
}
