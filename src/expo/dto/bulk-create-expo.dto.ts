import { ValidateNested } from 'class-validator';
import { CreateExpoDto } from './create-expo.dto';
import { Type } from 'class-transformer';

export class BulkCreateExpoDto {
  @ValidateNested({ each : true})
  @Type(() => CreateExpoDto)
  expos: CreateExpoDto[];
}
