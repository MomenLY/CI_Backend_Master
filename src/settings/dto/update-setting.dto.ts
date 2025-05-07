import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AsSetting {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsObject()
  @IsNotEmpty()
  settings: { [key: string]: any };
}
export class UpdateSettingDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AsSetting)
  AsSetting: AsSetting;
  AsAccountId: string;
}
