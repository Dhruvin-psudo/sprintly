import { IsEmail, IsString, MaxLength, MinLength, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName!: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string

    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsString()
    @IsEmail()
    @MaxLength(255)
    email!: string

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    passwordHash!: string
}