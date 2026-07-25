import { UserStatus } from "@prisma/client";

export class UserResponseDto {
    id!: string;
    email!: string;
    firstName!: string;
    lastName!: string;
    status!: UserStatus;
    avatarUrl!: string | null;
    phone!: string | null;
    timezone!: string | null;
    locale!: string | null;
    lastLoginAt!: Date | null;
    lastActiveOrgId!: string | null;
    createdAt!: Date;
    updatedAt!: Date;
}