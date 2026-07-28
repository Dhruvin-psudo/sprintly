import { IsUUID } from "class-validator";

export class AssignRoleDto {
    @IsUUID()
    userId!: string;

    @IsUUID()
    roleId!: string;
}