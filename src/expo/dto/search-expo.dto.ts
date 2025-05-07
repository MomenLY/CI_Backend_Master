import { IsDate, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { Type } from 'class-transformer';

export class SearchExpoDto extends PaginationDto {
  @IsString()
  @IsOptional()
  expDescription?: string;

  @IsString()
  @IsOptional()
  expName?: string;

  @IsString()
  @IsOptional()
  expType?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expStartDate?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expEndDate?: string;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsString()
  @IsOptional()
  sortColumn?: string;
  
  @IsString()
  @IsOptional()
  sortOrder?: string;

}