import { Body, Controller, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AllowOnboarding } from '../../common/decorators/allow-onboarding.decorator';
import type { IJwtUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../common/constants';

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
  }

  @AllowOnboarding()
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
  }
}
