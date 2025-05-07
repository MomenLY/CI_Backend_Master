import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class AsSetting {
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
export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  AsKey: string;
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AsSetting)
  AsSetting: AsSetting;
  AsAccountId: string;
}
