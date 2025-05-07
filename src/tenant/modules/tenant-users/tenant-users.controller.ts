import { Controller, Get, Param } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';

@Controller('tenant-users')
export class TenantUsersController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantUsersService.findOne(+id);
  }
}
