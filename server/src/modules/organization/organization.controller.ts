import { Body, Controller, Post, Res } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IRequestBy } from '../../common/interfaces/requested-user.interface';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import type { Response } from 'express';
import { REFRESH_TOKEN_COOKIE_NAME } from '../../common/constants';

@Controller('organization')
export class OrganizationController {

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService
  ) { }

  // Set Refresh Token into cookie
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

  @Post()
  async create(
    @Body() createOrgDto: CreateOrganizationDto,
    @CurrentUser() createdBy: IRequestBy,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {refreshToken, ...result} = await this.organizationService.create(createOrgDto, createdBy);

    if(refreshToken){
      this.setRefreshTokenCookie(res, refreshToken)
    }
    
    return ApiResponse.ok(result, 'Organization Creation Successful');
  }
}
