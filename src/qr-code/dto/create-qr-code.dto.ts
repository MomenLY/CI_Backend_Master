import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQrCodeDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'object' ? JSON.stringify(value) : value))
  payload: string;
}
