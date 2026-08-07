import { ProjectPhase, ProjectPriority } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

export class CreateProjectDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string;

    @IsString()
    @MinLength(2, { message: 'Project code must be at least 2 characters.' })
    @MaxLength(6, { message: 'Project code cannot exceed 6 characters.' })
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
    @Matches(/^[A-Z0-9]+$/, { message: 'Project code must contain only uppercase letters and numbers.' })
    code!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsNotEmpty({ message: 'Project status (phase) is required.' })
    @IsEnum(ProjectPhase, { message: 'Invalid project status (phase).' })
    phase!: ProjectPhase;

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
