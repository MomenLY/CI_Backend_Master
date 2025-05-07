import { Module, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { determineDatabaseModule } from './utils/helper';
import { RoleModule } from './role/role.module';
import { CaslModule } from './casl/casl.module';
import { LayoutModule } from './layout/layout.module';
import { SettingsModule } from './settings/settings.module';
import { CategoriesModule } from './categories/categories.module';
import { MasterDataModule } from './masterData/master-data.module';
import { ProfileFieldsModule } from './profileFields/profileFields.module';
import { TenantsModule } from './tenant/tenant.module';
import { LanguagesModule } from './languages/languages.module';
import { PasswordTokenModule } from './password-token/password-token.module';
import { ProfileModule } from './profile/profile.module';
import { HallModule } from './hall/hall.module';
import { ExpoModule } from './expo/expo.module';
import { ParticipantModule } from './participant/participant.module';
import { ScheduleModule } from './schedule/schedule.module';
import { OrderModule } from './order/order.module';
import { QrCodeModule } from './qr-code/qr-code.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          PRIMARY_DB_ENTITIES: ['Tenant', 'TenantUser'],
        }),
      ],
    }),
    determineDatabaseModule(),
    TodoModule,
    AuthModule,
    UsersModule,
    RoleModule,
    CaslModule,
    LayoutModule,
    SettingsModule,
    CategoriesModule,
    MasterDataModule,
    ProfileFieldsModule,
    TenantsModule,
    LanguagesModule,
    PasswordTokenModule,
    ProfileModule,
    HallModule,
    ExpoModule,
    ParticipantModule,
    ScheduleModule,
    OrderModule,
    QrCodeModule,
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    AppService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
