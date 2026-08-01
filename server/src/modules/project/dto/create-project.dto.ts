import { ProjectPhase, ProjectPriority } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateProjectDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsEnum(ProjectPhase)
    phase?: ProjectPhase;

    @IsOptional()
    @IsEnum(ProjectPriority)
    priority?: ProjectPriority;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dueDate?: Date;

    @IsUUID('4')
    leadId!: string;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    memberIds?: string[];
}
