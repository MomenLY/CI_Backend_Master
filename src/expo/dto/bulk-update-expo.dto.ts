// update-halls.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayNotEmpty } from 'class-validator';
import { UpdateExpoDto } from './update-expo.dto';

export class UpdateExposDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateExpoDto)
  @IsArray()
  @ArrayNotEmpty({ message: 'The expo array should not be empty' })
  expos: UpdateExpoDto[];
}
