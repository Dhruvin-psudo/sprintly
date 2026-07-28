import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto";
import { UserStatus } from "@prisma/client";
import { SortOrder } from "../../../common/constants";
import { Transform } from "class-transformer";

export enum UserSortBy {
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    EMAIL = 'email',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt'
}

export enum UserPopulate {
    MEMBERSHIPS = 'memberships',
}

export class UserQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus

    @IsOptional()
    @IsEnum(UserSortBy)
    sortBy?: UserSortBy

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder

    @IsOptional()
    @IsEnum(UserPopulate, { each: true })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? [value] : value))
    populate?: UserPopulate[]
}