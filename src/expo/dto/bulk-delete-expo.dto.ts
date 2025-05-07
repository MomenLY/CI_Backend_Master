import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class BulkDeleteExpoDto {
    @IsArray()
    @ArrayNotEmpty({ message: 'The expo array should not be empty' })
    @IsUUID(undefined, { each: true, message: 'Each expo ID must be a valid UUID' })
    ids: number[];
}
  