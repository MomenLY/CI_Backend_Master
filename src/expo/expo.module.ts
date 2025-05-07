import { Module } from '@nestjs/common';
import { ExpoService } from './expo.service';
import { ExpoController } from './expo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expo } from './entities/expo.entity';
import { CaslModule } from 'src/casl/casl.module';
import { ScheduleModule } from 'src/schedule/schedule.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expo]), CaslModule, ScheduleModule, ExpoModule],
  controllers: [ExpoController],
  providers: [ExpoService],
  exports: [ExpoService],
})
export class ExpoModule {}
