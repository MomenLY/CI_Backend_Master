import { Module } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { TenantUsersController } from './tenant-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantUser } from './entities/tenant-user.entity';
import { TenantUsersMongoService } from './tenant-users.mongo.service';
import { TenantUsersPostgresService } from './tenant-users.postgres.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantUser])],
  controllers: [TenantUsersController],
  providers: [TenantUsersService, TenantUsersMongoService, TenantUsersPostgresService],
  exports: [TenantUsersService],
})
export class TenantUsersModule {}
