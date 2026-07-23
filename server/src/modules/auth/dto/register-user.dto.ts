import { IsEmail, IsString, MaxLength, MinLength, IsOptional } from "class-validator";

export class RegisterUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    firstName!: string

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    lastName?: string

    @IsString()
    @IsEmail()
    @MaxLength(255)
    email!: string

    @IsString()
    @MaxLength(255)
    passwordHash!: string
}