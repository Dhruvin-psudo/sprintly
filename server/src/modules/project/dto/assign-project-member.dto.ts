import { IsArray, IsUUID } from "class-validator";

export class AssignProjectMemberDto {
    @IsArray()
    @IsUUID('4', { each: true })
    userIds!: string[];
}
