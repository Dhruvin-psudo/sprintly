import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { InvitationService } from './invitation.service';
import { SendInvitationDto, AcceptInvitationDto, InvitationQueryDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AllowWithoutOrg } from '../../common/decorators/allow-without-org.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission, REFRESH_TOKEN_COOKIE_NAME } from '../../common/constants';
import { ApiResponse } from '../../common/dto';
import type { IAuthenticatedUser } from '../../common/interfaces';

@Controller('invitation')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth',
      maxAge:
        this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS', 7) *
        24 *
        60 *
        60 *
        1000,
    });
  }

  @Post('send')
  @RequirePermissions(Permission.MEMBER_INVITE)
  async sendInvitation(
    @Body() dto: SendInvitationDto,
    @CurrentUser() caller: IAuthenticatedUser,
  ) {
    const result = await this.invitationService.sendInvitation(dto, caller);
    return ApiResponse.ok(result, result.message);
  }

  @Get()
  @RequirePermissions(Permission.MEMBER_READ)
  async getInvitations(
    @Query() query: InvitationQueryDto,
    @CurrentUser() caller: IAuthenticatedUser,
  ) {
    const { items, total, page, limit, totalPages } =
      await this.invitationService.getInvitations(caller, query);
    return ApiResponse.paginated(
      items,
      { page, limit, total, totalPages },
      'Invitations fetched successfully',
    );
  }

  @AllowWithoutOrg()
  @Get('verify/:token')
  async verifyToken(@Param('token') token: string) {
    const details = await this.invitationService.verifyToken(token);
    return ApiResponse.ok(details, 'Invitation token is valid.');
  }

  @AllowWithoutOrg()
  @Post('accept')
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.invitationService.acceptInvitation(dto);
    this.setRefreshTokenCookie(res, refreshToken);
    return ApiResponse.ok(result, 'Invitation accepted successfully.');
  }

  @Delete(':id')
  @RequirePermissions(Permission.MEMBER_REMOVE)
  async revokeInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: IAuthenticatedUser,
  ) {
    const result = await this.invitationService.revokeInvitation(id, caller);
    return ApiResponse.ok(null, result.message);
  }

  @Post('resend/:id')
  @RequirePermissions(Permission.MEMBER_INVITE)
  async resendInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: IAuthenticatedUser,
  ) {
    const result = await this.invitationService.resendInvitation(id, caller);
    return ApiResponse.ok(result.invitation, result.message);
  }

  @AllowWithoutOrg()
  @Post('decline')
  async declineInvitation(@Body() dto: { token: string }) {
    const result = await this.invitationService.declineInvitation(dto.token);
    return ApiResponse.ok(null, result.message);
  }

  @Get('my-pending')
  @AllowWithoutOrg()
  async getMyPendingInvitations(@CurrentUser() caller: IAuthenticatedUser) {
    const items = await this.invitationService.getMyPendingInvitations(caller);
    return ApiResponse.ok(items, 'Pending invitations fetched successfully');
  }

  @AllowWithoutOrg()
  @Post('accept/:id')
  async acceptForUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: IAuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.invitationService.acceptInvitationForUser(id, caller);
    this.setRefreshTokenCookie(res, refreshToken);
    return ApiResponse.ok(result, 'Invitation accepted successfully.');
  }

  @AllowWithoutOrg()
  @Post('decline/:id')
  async declineForUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: IAuthenticatedUser,
  ) {
    const result = await this.invitationService.declineInvitationForUser(id, caller);
    return ApiResponse.ok(null, result.message);
  }
}
