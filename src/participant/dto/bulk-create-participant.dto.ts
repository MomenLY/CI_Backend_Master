import { ValidateNested } from 'class-validator';
import { CreateParticipantDto } from './create-participant.dto';
import { Type } from 'class-transformer';

export class BulkCreateParticipantDto {
  @ValidateNested({ each : true})
  @Type(() => CreateParticipantDto)
  participants: CreateParticipantDto[];
}
