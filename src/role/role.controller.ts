import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Delete,
  Patch,
  Put,
  Request
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, RoleDto } from './dto/create-role.dto';
import { Public } from 'src/auth/auth.decorator';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Public()
  @Post()
  create(@Body() role: CreateRoleDto, @Request() req) {
    return this.roleService.create(role);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit = 9,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('sortBy') sortBy?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
    @Query('acl') acl?: boolean
  ): Promise<Pagination<RoleDto>> {
    limit = limit > 100 ? 100 : limit;

    const options: IPaginationOptions = {
      page,
      limit,
    };

    let roles: Pagination<RoleDto>;

      roles = await this.roleService.searchAndPaginate(
        options,
        search,
        type,
        sortBy,
        orderBy,
        acl
      );

    return roles;
  }

  @Patch()
  bulkUpdateRole(@Body() data: any) {
    return this.roleService.bulkUpdate(data);
  }

  @Get('users')
  async findUsers(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  @Query('search') keyword?: string,
  @Query('type') type?: string,
  @Query('sortBy') sortBy?: string,
  @Query('orderBy') orderBy?: 'asc' | 'desc' ) : Promise<Pagination<RoleDto>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    let roles: Pagination<RoleDto>;
    roles = await this.roleService.findUsersByRole(options,
      keyword,
      type,
      sortBy,
      orderBy);
        
    return roles;
  }

  @Get('/modules')
  async getModules(@Query('roleType') roleType: string) {
    return await this.roleService.getRoleModules(roleType);
  }
  @Get(':id')
  findOne(@Param('id') id: any) {
    return this.roleService.findOne(id);
  }

  @Delete()
  bulkDeleteRoles(@Body('roleIds') roleIds: string[]) {
    return this.roleService.bulkDeleteRoles(roleIds);
  }

  @Delete(':id')
  deleteRole(@Param('id') id: any) {
    return this.roleService.deleteById(id);
  }
}
