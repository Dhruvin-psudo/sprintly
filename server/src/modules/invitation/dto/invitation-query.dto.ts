import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { InvitationStatus } from '@prisma/client';

export class InvitationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(InvitationStatus, { message: 'Status must be a valid InvitationStatus.' })
  status?: InvitationStatus;
}
