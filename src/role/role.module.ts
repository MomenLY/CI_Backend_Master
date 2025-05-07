import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleMongoService } from './role.mongo.service';
import { RolePostgresService } from './role.postgres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RoleMongoService, RolePostgresService],
  exports: [RoleService, RoleMongoService, RolePostgresService],
})
export class RoleModule {}
