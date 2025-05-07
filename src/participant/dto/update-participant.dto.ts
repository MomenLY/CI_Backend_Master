import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsJSON,
  IsNotEmpty
} from 'class-validator';

export class UpdateParticipantDto {
  @IsUUID()
  @IsNotEmpty({ message: 'ID should not be empty' })
  id: string;

  @IsUUID()
  @IsOptional()
  epUserId?: string;

  @IsUUID()
  @IsOptional()
  epExpoId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'object' ? JSON.stringify(value) : value))
  epUserDetails?: string;

  @IsBoolean()
  @IsOptional()
  epStatus?: boolean;

  @IsString()
  @IsOptional()
  epOrderid?: string;

  @IsUUID()
  @IsOptional()
  epCreatedBy?: string;

  @IsBoolean()
  @IsOptional()
  epAttendance?: boolean;

  @IsJSON()
  @IsOptional()
  epAttendeeLog?: any;
}
