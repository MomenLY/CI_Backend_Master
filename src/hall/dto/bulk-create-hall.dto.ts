import { ValidateNested } from 'class-validator';
import { CreateHallDto } from './create-hall.dto';
import { Type } from 'class-transformer';

export class BulkCreateHallDto {
  @ValidateNested({ each : true})
  @Type(() => CreateHallDto)
  halls: CreateHallDto[];
}
