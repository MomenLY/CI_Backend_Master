import { Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  ValidateIf,
  IsNotEmptyObject,
  IsArray,
  ArrayMaxSize
} from 'class-validator';
import { IsObjectIdOrUUID, ValidateObject } from 'src/utils/helper';
import { fieldTypes, validationTypes } from './createProfileField.dto';
import { FileUploadParams } from '../entities/profileFields.entity';

class ValidationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(validationTypes, { message: `type must be either ${validationTypes}` })
  type: string;

  @IsString()
  @IsDefined()
  // @IsNotEmpty()
  @ValidateIf(o => o.type === 'custom')
  regexPattern: string;

  @IsString()
  // @IsNotEmpty()
  errorMessage: string;
}

export class UpdateProfileFieldDto {
  @IsString()
  @IsNotEmpty()
  @IsObjectIdOrUUID()
  _id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  pFLabel: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsIn(fieldTypes, { message: `pFType must be ${fieldTypes}` })
  pFType: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  pFOrder: number;

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  @ValidateObject({ message: 'pFData must be a valid key-value object' })
  pFData: object;

  @ValidateNested()
  @IsOptional()
  @Type(() => FileUploadParams)
  pFUploadParams: FileUploadParams;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  pFPlaceholder: string;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  pFHelperText: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @IsIn([0, 1], { message: 'pFStatus must be either 0 or 1' })
  pFStatus: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @IsIn([0, 1], { message: 'pFRequired must be either 0 or 1' })
  pFRequired: number;

  @IsString()
  @IsOptional()
  pFColumName: string;

  @IsString()
  @IsOptional()
  pFColumType: string;

  @IsObject()
  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ValidationDto)
  pFValidation: ValidationDto;
}

export class BatchDeleteDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @ArrayMaxSize(50)
  @IsObjectIdOrUUID({ each: true })
  ids: string[];
}