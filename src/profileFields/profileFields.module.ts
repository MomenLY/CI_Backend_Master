import { Module } from '@nestjs/common';
import { ProfileFieldsService } from './profileFields.service';
import { ProfileFieldsController } from './profileFields.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileFields } from './entities/profileFields.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { ProfileFieldsMongoService } from './profileFields.mongo.service';
import { ProfileFieldsPostgresService } from './profileFields.postgres.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileFields]), ProfileModule],
  controllers: [ProfileFieldsController],
  providers: [ProfileFieldsService, ProfileFieldsMongoService, ProfileFieldsPostgresService],
  exports: [ProfileFieldsService]
})
export class ProfileFieldsModule {}
