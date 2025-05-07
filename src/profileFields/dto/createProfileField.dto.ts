import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDefined,
  ValidateNested,
  IsNumber,
  IsIn,
  ValidateIf,
  IsNotEmptyObject,
} from 'class-validator';
import { ValidateObject } from 'src/utils/helper';
import { FileUploadParams } from '../entities/profileFields.entity';

export const fieldTypes = ['input', 'select', 'file', 'date', 'datetime', 'time','phoneNumber'];
export const validationTypes = ['text', 'number', 'email', 'url', 'json', 'custom','any','futureDate','pastDate'];

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

export class CreateProfileFieldDto {
  @IsString()
  @IsNotEmpty()
  pFLabel: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(fieldTypes, { message: `pFType must be ${fieldTypes}` })
  pFType: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateIf(o => o.pFType === 'select')
  @ValidateObject({ message: 'pFData must be a valid key-value object' })
  pFData: object;

  @ValidateNested()
  @ValidateIf(o => o.pFType === 'file')
  @Type(() => FileUploadParams)
  pFUploadParams: FileUploadParams;

  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  pFPlaceholder: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  pFFormType: string


  @IsString()
  @IsOptional()
  // @IsNotEmpty()
  pFHelperText: string;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1], { message: 'pFStatus must be either 0 or 1' })
  pFStatus: number;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1], { message: 'pFRequired must be either 0 or 1' })
  pFRequired: number;

  @IsString()
  @IsOptional()
  pFColumName: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1], { message: 'pFRequired must be either 0 or 1' })
  pFDefault: number

  @IsString()
  @IsOptional()
  pFColumType: string;

  @IsNumber()
  @IsOptional()
  pFOrder: number;

  @IsObject()
  @IsNotEmpty()
  @IsNotEmptyObject()
  @ValidateIf(o => o.pFRequired === 1)
  @ValidateNested()
  @Type(() => ValidationDto)
  pFValidation: ValidationDto;
}
