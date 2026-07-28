import { Body, Controller, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { IJwtUser } from '../../common/interfaces';
import { ApiResponse } from '../../common/dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organization')
export class OrganizationController {

  constructor(
    private readonly organizationService: OrganizationService,
  ) { }

  @Post()
  async create(
    @Body() createOrgDto: CreateOrganizationDto,
    @CurrentUser() createdBy: IJwtUser,
  ) {
    const result = await this.organizationService.create(createOrgDto, createdBy);
    return ApiResponse.ok(result, 'Organization Creation Successful');
  }
}
