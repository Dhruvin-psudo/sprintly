import { IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";

export class CreateOrganizationDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string

    @IsOptional()
    @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    @MaxLength(255)
    email?: string
}