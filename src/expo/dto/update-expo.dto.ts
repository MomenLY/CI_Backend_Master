import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    IsNumber,
  } from 'class-validator';
  import { Transform } from 'class-transformer';

  export class UpdateExpoDto {
    
    @IsUUID()
    @IsNotEmpty({ message: 'Expo ID should not be empty' })
    id: string;

    @IsString()
    @IsOptional()
    expName?: string;

    @IsString()
    @IsOptional()
    expType?: string;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : null))
    expStartDate: Date;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : null))
    expEndDate: Date;

    @IsString()
    @IsNotEmpty()
    expDescription: string;

    @IsString()
    @IsOptional()                   
    expLayoutId?: string;

    @IsBoolean()
    @IsOptional()
    expDeleted: boolean;

    @IsString()
    @IsOptional()
    expExpoMode: string;

    @IsString()             
    @IsOptional()
    expAddress?: string;

    @IsBoolean() 
    @IsOptional()
    expIsPaid: boolean;

    @IsNumber()
    @IsOptional()
    expPrice?: number;

    @IsString() 
    @IsOptional()
    expCode?: string;

    @IsString() 
    @IsOptional()
    expImage?: string;

    @IsBoolean()
    @IsOptional()
    expTermsConditionIsEnabled?: boolean;

    @IsString()
    @IsOptional()
    expTermsAndConditions?: string;

    @IsBoolean()
    @IsOptional()
    expIsRegistrationEnabled?: boolean;

    @IsBoolean()
    @IsOptional()
    expIsSeatsUnlimited?: boolean;
    
    @IsNumber()
    @IsOptional()
    expMinSeats?: number;

    @IsNumber()
    @IsOptional()
    expMaxSeats?: number;

    @IsString()
    @IsOptional()
    expRegistrationStartType?: string;

    @IsDate()
    @Transform(({ value }) => (value? new Date(value) : null))
    @IsOptional()
    expRegistrationStartDate?: Date;

    @IsNumber()
    @IsOptional()
    expRegistrationStartBefore?: number;

    @IsString()
    @IsOptional()
    expRegistrationEndType?: string;

    @IsDate()
    @Transform(({ value }) => (value? new Date(value) : null))
    @IsOptional()
    expRegistrationEndDate?: Date;

    @IsNumber()
    @IsOptional()
    expRegistrationEndBefore?:number;

    @IsString()
    @IsOptional()
    expCreatedBy?: string;

    @IsBoolean()
    @IsOptional()
    expStatus?:boolean;

}
