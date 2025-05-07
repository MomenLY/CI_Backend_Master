import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CaslModule } from 'src/casl/casl.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from 'src/role/entities/role.entity';

import { RoleModule } from 'src/role/role.module';
import { TenantUser } from 'src/tenant/modules/tenant-users/entities/tenant-user.entity';
import { EmailLibrary } from 'src/utils/emailLibrary';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { TenantsModule } from 'src/tenant/tenant.module';
import { PasswordTokenModule } from 'src/password-token/password-token.module';
import { UsersHelperModule } from 'src/usersHelper/usersHelper.module';
import { ProfileFieldsModule } from 'src/profileFields/profileFields.module';
import { UsersMongoService } from './users.mongo.service';
import { UsersPostgresService } from './users.postgres.service';
import { SettingsModule } from 'src/settings/settings.module';
@Module({
  imports: [
    RoleModule,
    PasswordTokenModule,
    SettingsModule,
    TypeOrmModule.forFeature([User, TenantUser, Role, Tenant]),
    CaslModule,
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 36000,
        },
      }),
      inject: [ConfigService],
    }),
    TenantsModule,
    UsersHelperModule,
    ProfileFieldsModule
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailLibrary, UsersMongoService, UsersPostgresService],
  exports: [UsersService],
})
export class UsersModule {}
