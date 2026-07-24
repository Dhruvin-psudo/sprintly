import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateOrganizationDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string
}