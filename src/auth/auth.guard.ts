import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_CREATE_USER_KEY, IS_PUBLIC_KEY, shouldBypassAuth } from './auth.decorator';
import { UsersService } from 'src/users/users.service';
import { RoleService } from 'src/role/role.service';
import { RoleType } from 'src/role/entities/role.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private roleService: RoleService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isCreateUser = this.reflector.getAllAndOverride<boolean>(IS_CREATE_USER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isBypassed = shouldBypassAuth(context, this.reflector);
    if ((isPublic || isBypassed) && request.get('context') !== 'admin') {
      return true;
    }
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      if(isCreateUser) {
        return true;
      }
      throw new UnauthorizedException();
    }
    try {
      const configService = this.configService;
      const payload = await this.jwtService.verifyAsync(token, {
        secret: configService.get('JWT_SECRET'),
      });
      const aclObject = {};
      const user = await this.usersService.findOne(payload._id);
      let userRole = RoleType.ENDUSER;
      if (user.roleIds?.length > 0) {
        const roles = await this.roleService.findByIds(user.roleIds);
        const roleAcls = roles.map((r) => {
          if(r.roleType === RoleType.ADMIN) {
            userRole = RoleType.ADMIN;
          }
          return r.acl
        })
        const aclArray = [user.acl, ...roleAcls].filter(
          (x) => x,
        );
        for (const acl of aclArray) {
          const aclKeys = Object.keys(acl);
          for (const aclKey of aclKeys) {
            if (!aclObject[aclKey]) {
              aclObject[aclKey] = {};
            }
            const aclFeatKeys = Object.keys(acl[aclKey]);
            for (const aclFeatKey of aclFeatKeys) {
              if (!aclObject[aclKey][aclFeatKey]) {
                aclObject[aclKey][aclFeatKey] = { ...acl[aclKey][aclFeatKey] };
              } else if (acl[aclKey][aclFeatKey].permission) {
                aclObject[aclKey][aclFeatKey].permission = true;
              }
            }
          }
        }
      }
      request['user'] = { ...payload, acl: aclObject, role: userRole };
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
