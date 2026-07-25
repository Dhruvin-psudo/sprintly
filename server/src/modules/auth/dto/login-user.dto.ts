import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class loginUserDto {
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string    
}