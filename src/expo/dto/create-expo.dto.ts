import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsUUID,
    IsEnum,    
  } from 'class-validator';
  import { Transform } from 'class-transformer';
  import { Expo, ExpoMode, ExpoType, RegType } from '../entities/expo.entity';

  export class CreateExpoDto {

    @IsString()
    @IsNotEmpty()
    expName: string;
    
    @IsEnum(ExpoType)
    @IsOptional()
    expType?: ExpoType;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    expStartDate: Date;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    expEndDate: Date;

    @IsString()
    @IsNotEmpty()
    expDescription: string;

    @IsUUID()
    @IsOptional()
    expLayoutId?: string;

    @IsBoolean()
    @IsOptional()
    expDeleted?: boolean;

    @IsEnum(ExpoMode)
    @IsOptional()
    expExpoMode?: ExpoMode;

    @IsString()
    @IsOptional()
    expAddress?: string;

    @IsBoolean()
    @IsOptional()
    expIsPaid?: boolean;

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

    @IsEnum(RegType)
    @IsOptional()
    expRegistrationStartType?: RegType;

    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsOptional()
    expRegistrationStartDate?: Date;

    @IsNumber()
    @IsOptional()
    expRegistrationStartBefore?: number;

    @IsEnum(RegType)
    @IsOptional()
    expRegistrationEndType?: RegType;

    @IsDate()
    @Transform(({ value }) => value ? new Date(value) : null)
    @IsOptional()
    expRegistrationEndDate?: Date;

    @IsNumber()
    @IsOptional()
    expRegistrationEndBefore?: number;

    @IsUUID()
    @IsOptional()
    expCreatedBy?: string;

    @IsBoolean()
    @IsOptional()
    expStatus?: boolean;
}

export class ExpoDto {
  id: string;
  
  @IsString()
  expName: string;

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
  expDeleted: boolean;  

  @IsString()
  expExpoMode: string;  

  @IsString()             
  @IsOptional()
  expAddress?: string;  

  @IsBoolean() 
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

  @IsBoolean()
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

  constructor(expo?: Partial<Expo>) {
    if (expo) {
      this.id = expo.id;
      this.expName = expo.expName;
      this.expType = expo.expType;
      this.expStartDate = expo.expStartDate;
      this.expEndDate = expo.expEndDate;
      this.expDescription = expo.expDescription;                  
      this.expLayoutId = expo.expLayoutId;
      this.expDeleted = expo.expDeleted;
      this.expExpoMode = expo.expExpoMode;
      this.expAddress = expo.expAddress;
      this.expIsPaid = expo.expIsPaid;
      this.expPrice = expo.expPrice;
      this.expCode = expo.expCode;
      this.expImage = expo.expImage;
      this.expTermsConditionIsEnabled = expo.expTermsConditionIsEnabled;
      this.expTermsAndConditions = expo.expTermsAndConditions;
      this.expIsRegistrationEnabled = expo.expIsRegistrationEnabled;
      this.expIsSeatsUnlimited = expo.expIsSeatsUnlimited;
      this.expMinSeats = expo.expMinSeats;
      this.expMaxSeats = expo.expMaxSeats;
      this.expRegistrationStartType = expo.expRegistrationStartType;
      this.expRegistrationStartDate = expo.expRegistrationStartDate;
      this.expRegistrationStartBefore = expo.expRegistrationStartBefore;
      this.expRegistrationEndType = expo.expRegistrationEndType;
      this.expRegistrationEndDate = expo.expRegistrationEndDate;
      this.expRegistrationEndBefore = expo.expRegistrationEndBefore; 
      this.expCreatedBy = expo.expCreatedBy;
      this.expStatus = expo.expStatus;
    }
  }
}