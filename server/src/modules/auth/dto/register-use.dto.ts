import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterUsetDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string

    @IsString()
    @IsEmail()
    @MaxLength(255)
    email!: string

    @IsString()
    @MaxLength(255)
    password!: string
}