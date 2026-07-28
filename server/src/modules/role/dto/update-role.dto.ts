import { IsArray, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @IsArray()  
    @IsUUID('4', { each: true})
    @IsOptional()
    permissionIds?: string[];
}