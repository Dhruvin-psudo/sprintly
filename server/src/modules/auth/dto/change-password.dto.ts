import { MaxLength, MinLength, IsString } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    currentPassword!: string

    @IsString()
    @MinLength(8)
    @MaxLength(128)
    newPassword!: string
}