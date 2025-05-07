// update-halls.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayNotEmpty } from 'class-validator';
import { UpdateHallDto } from './update-hall.dto';

export class UpdateHallsDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateHallDto)
  @IsArray()
  @ArrayNotEmpty({ message: 'The halls array should not be empty' })
  halls: UpdateHallDto[];


}
