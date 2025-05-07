import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SettingsModule } from 'src/settings/settings.module';
import { RoleService } from 'src/role/role.service';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    UsersModule,
    SettingsModule,
    RoleModule,
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
  ],
  providers: [AuthService, RoleService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
