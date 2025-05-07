import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Search,
} from '@nestjs/common';
import { CreateRoleDto, RoleDto } from './dto/create-role.dto';
import { Role, RoleType } from './entities/role.entity';
import { In, MongoRepository, Repository } from 'typeorm';
import { isMongoDB } from 'src/utils/helper';
import { TENANT_CONNECTION } from 'src/tenant/tenant.module';
import { ErrorMessages } from 'src/utils/messages';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { User } from 'src/users/entities/user.entity';
import { RoleMongoService } from './role.mongo.service';
import { RolePostgresService } from './role.postgres.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import adminModules from 'src/utils/admin.module';
import userModules from 'src/utils/user.module';
const fs = require('fs');
const path = require('path');

@Injectable()
export class RoleService {
  private roleRepository: Repository<Role> & MongoRepository<Role>;
  private userRepository: Repository<User> & MongoRepository<User>;

  constructor(
    @Inject(TENANT_CONNECTION) private connection,
    private roleMongoService: RoleMongoService,
    private rolePostgresService: RolePostgresService) {
    this.roleRepository = this.connection.getRepository(Role);
    this.userRepository = this.connection.getRepository(User);
  }

  async create(createRole: CreateRoleDto) {
    const { name, roleType, acl, areIsDefault } = createRole;
    if (!Object.values(RoleType).includes(roleType)) {
      throw new BadRequestException(ErrorMessages.INVALID_ROLE_TYPE);
    }

    const role = new Role();

    role.name = name;
    role.roleType = roleType || RoleType.ADMIN;
    role.acl = acl as any;
    role.areIsDefault = areIsDefault || 0;
    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<any> {
    const roles = await this.roleRepository.find();
    return roles;
  }

  async bulkUpdate(roles: Partial<Role>[]): Promise<Role[]> {
    const updatedRoles: Role[] = [];
    for (const roleData of roles) {
      let role;
      if (isMongoDB) {
        role = await this.roleMongoService.findOneById(this.roleRepository, roleData._id)
      } else {
        role = await this.rolePostgresService.findOneById(this.roleRepository, roleData._id)
      }

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleData._id} not found`);
      }
      const updatedRole = this.roleRepository.merge(role, roleData);
      updatedRoles.push(await this.roleRepository.save(updatedRole));
    }
    return updatedRoles;
  }

  async searchAndPaginate(
    options: IPaginationOptions,
    keyword?: string,
    type?: string,
    sortBy?: string,
    orderBy?: 'asc' | 'desc',
    acl?: boolean
  ): Promise<Pagination<RoleDto>> {
    const page = Number(options.page);
    const limit = Number(options.limit);

    if (isMongoDB) {
      return this.roleMongoService.searchRoles(this.roleRepository, keyword, type, sortBy, orderBy, limit, page)
    } else {
      return this.rolePostgresService.searchRoles(this.roleRepository, keyword, type, sortBy, orderBy, limit, page,acl)
    }
  }

  async findByIds(ids: string[]) {

    if (isMongoDB) {
      return this.roleMongoService.findByIds(this.roleRepository, ids);
    } else {
      return this.rolePostgresService.findByIds(this.roleRepository, ids);
    }
  }

  async findOne(_id: any) {
    const role = await this.roleRepository.findOneBy({ _id });
    if (role) {
      const { ...rest } = role;
      return rest;
    } else {
      throw new NotFoundException(ErrorMessages.ROLE_NOT_FOUND);
    }
  }

  async findOneByRoleType(roleType: RoleType) {
    return this.roleRepository.findOne({ where: { roleType } });
  }

  async bulkDeleteRoles(roleIds: string[]): Promise<{ message: string }> {
    let deletedCount = 0;
    if (isMongoDB) {
      deletedCount = await this.roleMongoService.deleteMany(this.roleRepository, roleIds);
    } else {
      deletedCount = await this.rolePostgresService.deleteMany(this.userRepository, this.roleRepository, roleIds);
    }

    if (deletedCount === 0) {
      throw new NotFoundException('No roles found with the provided IDs');
    }

    return { message: 'Roles deleted successfully' };
  }

  async findUsersByRole(
    options: IPaginationOptions,
    keyword?: string,
    type?: string,
    sortBy?: string,
    orderBy?: 'asc' | 'desc',
  ): Promise<Pagination<RoleDto>> {
    try {
      const page = Number(options.page);
      const limit = Number(options.limit);
      if (isMongoDB) {
        const response = await this.roleMongoService.usersByRoleMongo(this.userRepository, keyword, type, sortBy, orderBy, limit, page);
        return response;
      } else {
        const response = await this.rolePostgresService.usersByRolePostgres(this.roleRepository, keyword, type, sortBy, orderBy, limit, page);
        return response;
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteById(id: any) {
    return this.roleRepository.delete(id);
  }

  async getRoleModules(roleType: string) {
    try {
      const roleModules = {
        admin: adminModules,
        enduser: userModules
      };
      return typeof roleModules[roleType] !== "undefined" ? roleModules[roleType] : {}
    }
    catch (error) {
      throw error;
    }
  }
}
