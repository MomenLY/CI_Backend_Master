import { IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckAvailabilityDto {
  @IsUUID()
  expoId: string;

  @IsUUID()
  hallId: string;

  @IsDate()
  @Type(() => Date)
  startDateTime: Date;

  @IsDate()
  @Type(() => Date)
  endDateTime: Date;
}
