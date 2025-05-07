import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class BulkDeleteHallDto {
    @IsArray()
    @ArrayNotEmpty({ message: 'The halls array should not be empty' })
    @IsUUID(undefined, { each: true, message: 'Each hall ID must be a valid UUID' })
    ids: number[];
}
  