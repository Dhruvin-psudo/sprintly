import { ProjectPhase, ProjectPriority } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto";

export class ProjectQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(ProjectPhase)
    phase?: ProjectPhase;

    @IsOptional()
    @IsEnum(ProjectPriority)
    priority?: ProjectPriority;
}
