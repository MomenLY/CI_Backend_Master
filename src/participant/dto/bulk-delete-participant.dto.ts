import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class BulkDeleteParticipantDto {
    @IsArray()
    @ArrayNotEmpty({ message: 'The participants array should not be empty' })
    @IsUUID(undefined, { each: true, message: 'Each participant ID must be a valid UUID' })
    ids: number[];
}
  