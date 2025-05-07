import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from '@node-rs/bcrypt';
import { DataSource, In } from 'typeorm';
import { TenantUsersService } from 'src/tenant/modules/tenant-users/tenant-users.service';
import { ConfigService } from '@nestjs/config';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { UserSubscriber } from 'src/entity-subscribers/user.subscriber';
import { User, UserStatus } from 'src/users/entities/user.entity';
import { CreateDatabaseConnection, findTenant } from 'src/utils/db-utls';
import { ErrorMessages } from 'src/utils/messages';
import { SettingsService } from 'src/settings/settings.service';
import { AccountSettings } from 'src/settings/entities/setting.entity';
import { RoleService } from 'src/role/role.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleType } from 'src/role/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private tenantUserService: TenantUsersService,
    private jwtService: JwtService,
    private connection: DataSource,
    private configService: ConfigService,
    private readonly settingsService: SettingsService,
    private roleService: RoleService
  ) { }

  async signIn(
    email: string,
    password: string,
    xTenantId: string = '',
    key: string
  ): Promise<any> {
    try {
      const IDENTIFY_TENANT_FROM_PRIMARY_DB =
        this.configService.get('IDENTIFY_TENANT_FROM_PRIMARY_DB') === 'true';

      if (IDENTIFY_TENANT_FROM_PRIMARY_DB) {
        const tenantUser = await this.tenantUserService.findOneByEmail(email);
        if (tenantUser) {
          xTenantId = tenantUser.tenantIdentifier;
        } else {
          throw new BadRequestException(ErrorMessages.WRONG_CREDENTIALS);
        }
      }

      const tenant: Tenant = await findTenant(this.connection, xTenantId, key);
      console.log(tenant, "tenanttenanttenanttenant");
      if (!tenant) {
        throw new BadRequestException(ErrorMessages.DATABASE_CONNECTION_ERROR);
      }

      const { dbHost, dbPort, dbUserName, dbPassword } = tenant;

      const options = {
        name: tenant.name,
        database: tenant.name,
        logging: true,
        host: dbHost,
        port: +dbPort,
        username: dbUserName,
        password: dbPassword,
        subscribers: [UserSubscriber],
      };

      const dataSource: DataSource = await CreateDatabaseConnection(options);
      const _userRepository = dataSource.getRepository(User);
      const _passwordRepository = dataSource.getRepository(AccountSettings);
      const _rolesRepository = dataSource.getRepository(Role);
      const result = await _passwordRepository.findOne({
        where: { AsKey: 'password' },
      });

      const user = await _userRepository.findOne({ where: { email } });
      //console.log(user, "login userrr");

      if (!user) {
        throw new BadRequestException(ErrorMessages.WRONG_CREDENTIALS);
      }
      if (!(await bcrypt.compare(password, user?.password))) {
        throw new BadRequestException(ErrorMessages.WRONG_CREDENTIALS);
      }

      if (user.status === "Inactive" || user.status === "Suspended") {
        return {
          message: `Your account is ${user.status}. Please contact Admin.`,
          tenant: xTenantId,
        };
      }

      const payload = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      };

      let roleDetails;

      if (user?.roleIds?.length === 0) {
        throw new Error("No roles have been assigned to this user")
      } else {
        if (user?.roleIds?.length === 1) {
          console.log(user.roleIds.length, "role length");
          const firstRoleId = user.roleIds[0];
          roleDetails = await _rolesRepository.findOne({ where: { _id: firstRoleId } });
          console.log(roleDetails, "role detailsss");
        } else if (user?.roleIds?.length > 1) {
          roleDetails = await _rolesRepository.find({
            where: {
              _id: In(user.roleIds)
            }
          });
        }

        await dataSource.destroy();

        const authResponse = {
          resetPassword: (user.enforcePasswordReset === 1),
          access_token: await this.jwtService.signAsync(payload),
          tenant: xTenantId,
          user: {
            uuid: user._id,
            userAcl: user.acl,
            ...(
              user.roleIds.length === 1 ? {
                role: roleDetails.roleType,
                roleId: roleDetails._id,
                roleAcl: roleDetails.acl,
                isDefault: roleDetails.areIsDefault
              } : {
                roles: roleDetails
              }
            ),
            featureRestrictions: tenant.featuresRestrictions,
            data: {
              displayName: user.firstName + ' ' + user.lastName,
              email: user.email,
            },
          },
        };
        return authResponse;
      }
    } catch (e) {
      throw e;
    }
  }


}
