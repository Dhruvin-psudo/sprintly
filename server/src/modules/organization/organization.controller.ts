import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AllowWithoutOrg } from '../../common/decorators/allow-without-org.decorator';
import type { IJwtUser, IRequestBy } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../common/constants';
import { SwitchOrganizationDto } from './dto/switch-organization.dto';

@Controller('organization')
export class OrganizationController {

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService,
  ) { }

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
  };

  @Get()
  async getOrgById(@CurrentUser('organizationId') orgId: string) {
    const org = await this.organizationService.findOrgById(orgId);
    return ApiResponse.ok(org, 'Organization fetched successfully')
  };

  @Get('all')
  async getAllOrg(@CurrentUser('userId') userId : string) {
    const orgs = await this.organizationService.getUserOrganizations(userId);
    return ApiResponse.ok(orgs, 'All Organizations fetched successfully')
  } 

  @AllowWithoutOrg()
  @Post()
  async create(
    @Body() createOrgDto: CreateOrganizationDto,
    @CurrentUser() createdBy: IJwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.organizationService.create(createOrgDto, createdBy);

    if (refreshToken) {
      this.setRefreshTokenCookie(res, refreshToken);
    }

    return ApiResponse.ok(result, 'Organization Creation Successful');
  };

  @Post('switch')
  async switch(
    @Body() dto: SwitchOrganizationDto,
    @CurrentUser() switchedBy: IRequestBy,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.organizationService.switchOrganization(
      dto.organizationId,
      switchedBy
    )

    this.setRefreshTokenCookie(res, refreshToken)

    return ApiResponse.ok({ accessToken }, 'Organization switched successfully')
  }
}
