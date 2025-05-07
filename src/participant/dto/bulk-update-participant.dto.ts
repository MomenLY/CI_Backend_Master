// update-halls.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayNotEmpty } from 'class-validator';
import { UpdateParticipantDto } from './update-participant.dto';

export class UpdateParticipantsDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateParticipantDto)
  @IsArray()
  @ArrayNotEmpty({ message: 'The halls array should not be empty' })
  participants: UpdateParticipantDto[];


}
