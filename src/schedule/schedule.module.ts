// schedule.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { Schedule } from './entities/schedule.entity';
import { HallAvailabilityModule } from '../libs/hall-availability/hall-availability.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule]),
        HallAvailabilityModule,
    ],
    controllers: [ScheduleController],
    providers: [ScheduleService],
})
export class ScheduleModule {}
