
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HallAvailabilityService } from './hall-availability.service';
import { Schedule } from '../../schedule/entities/schedule.entity'; // Adjust the import path as necessary

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  providers: [HallAvailabilityService],
  exports: [HallAvailabilityService],
})
export class HallAvailabilityModule {}
