import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { Transform } from 'class-transformer';

export class SearchScheduleDto extends PaginationDto {
  @IsString()
  @IsOptional()
  schName?: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  schStartDateTime?: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  schEndDateTime?: Date;

  @IsUUID()
  @IsOptional()
  schHallId?: string;

  @IsUUID()
  @IsOptional()
  schExpoId?: string;

  @IsString()
  @IsOptional()
  sortColumn?: string;

  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
