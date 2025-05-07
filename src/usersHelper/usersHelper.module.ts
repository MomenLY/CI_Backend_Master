import { Module } from '@nestjs/common';
import { UsersHelper } from 'src/usersHelper/users.helper';
import { EmailLibrary } from 'src/utils/emailLibrary';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory/casl-ability.factory';
import { ProfileModule } from 'src/profile/profile.module';
import { ProfileFieldsModule } from 'src/profileFields/profileFields.module';
import { UsersMongoHelper } from './users.mongo.helper';
import { UsersPostgresHelper } from './users.postgres.helper';
import { TenantUsersModule } from 'src/tenant/modules/tenant-users/tenant-users.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [ProfileModule, ProfileFieldsModule, TenantUsersModule, SettingsModule],
  providers: [EmailLibrary, UsersHelper, CaslAbilityFactory, UsersMongoHelper, UsersPostgresHelper],
  exports: [UsersHelper],
})
export class UsersHelperModule {}
