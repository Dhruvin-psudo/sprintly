import { Body, Controller, Post, Res } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { IRequestBy } from '../common/interfaces/requested-user.interface';
import { ApiResponse } from '../common/dto/api-response.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organization')
export class OrganizationController {

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService
  ) { }

  @Post()
  async create(
    @Body() createOrgDto: CreateOrganizationDto,
    @CurrentUser() createdBy: IRequestBy,
    @Res({ passthrough: true }) res: Response,
  ) {
    const organization = await this.organizationService.create(createOrgDto, createdBy)

    return ApiResponse.ok({organization}, 'Organization Creation Successful')
  }
}
