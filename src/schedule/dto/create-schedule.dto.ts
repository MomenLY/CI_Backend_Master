import { Transform } from 'class-transformer';
import { IsString, IsUUID, IsArray, IsOptional, IsDate } from 'class-validator';
import { Schedule } from '../entities/schedule.entity';

export class CreateScheduleDto {
  @IsString()
  @IsOptional()
  schName?: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  schStartDateTime: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  schEndDateTime: Date;

  @IsUUID()
  schHallId: string;

  @IsUUID()
  schExpoId: string;

  @IsString()
  @IsOptional()
  schDescription?: string;

  @IsString()
  @IsOptional()
  schAgenda?: string;

  @IsString()
  @IsOptional()
  schBannerImage?: string;

  @IsString()
  @IsOptional()
  schParticipantLink?: string;

  @IsString()
  @IsOptional()
  schBackstageLink?: string;

  @IsArray()
  @IsUUID('all', { each: true })
  ssUserId: string[];
}

export class ScheduleDto {
  id: string;

  @IsString()
  @IsOptional()
  schName?: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  schStartDateTime: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  schEndDateTime: Date;

  @IsUUID()
  schHallId: string;

  @IsUUID()
  schExpoId: string;

  @IsString()
  @IsOptional()
  schDescription?: string;

  @IsString()
  @IsOptional()
  schAgenda?: string;

  @IsString()
  @IsOptional()
  schBannerImage?: string;

  @IsString()
  @IsOptional()
  schParticipantLink?: string;

  @IsString()
  @IsOptional()
  schBackstageLink?: string;

  @IsUUID()
  schCreatedBy: string;

  @IsArray()
  @IsUUID('all', { each: true })
  ssUserId: string[];

  constructor(schedule?: Partial<Schedule>) {
    if (schedule) {
      this.schName = schedule.schName;
      this.schStartDateTime = schedule.schStartDateTime;
      this.schEndDateTime = schedule.schEndDateTime;
      this.schHallId = schedule.schHallId;
      this.schDescription = schedule.schDescription;
      this.schAgenda = schedule.schAgenda;
    }
  }
}