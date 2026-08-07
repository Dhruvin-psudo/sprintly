import { ProjectPhase, ProjectPriority } from "@prisma/client";
import { IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto";
import { SortOrder } from "../../../common/constants";
import { Transform } from "class-transformer";

export class ProjectQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() as ProjectPhase : value))
    @IsEnum(ProjectPhase)
    phase?: ProjectPhase;

    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() as ProjectPriority : value))
    @IsEnum(ProjectPriority)
    priority?: ProjectPriority;

    @IsOptional()
    @IsIn(['createdAt', 'phase', 'priority', 'startDate', 'dueDate'])
    sortBy?: 'createdAt' | 'phase' | 'priority' | 'startDate' | 'dueDate';

    @IsOptional()
    @Transform(({value}) => (typeof value === 'string' ? value.toLowerCase() as SortOrder : value))
    @IsIn(['asc', 'desc'])
    sortOrder?: SortOrder;
}
