import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { HttpModule } from '@nestjs/axios';
import { LanguagesMongoService } from './languages.mongo.service';
import { LanguagesPostgresService } from './languages.postgres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language]), HttpModule],
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguagesMongoService, LanguagesPostgresService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
