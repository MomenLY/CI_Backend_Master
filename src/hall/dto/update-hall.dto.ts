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
    isNotEmpty,
  } from 'class-validator';

  export class UpdateHallDto {
    
    @IsUUID()
    @IsNotEmpty({ message: 'Hall ID should not be empty' })
    id: string;

    @IsString()
    @IsNotEmpty()
    hallExpoId : string;

    @IsString()
    @IsNotEmpty()
    hallName : string;

    @IsString()
    @IsNotEmpty()
    hallDescription : string;

    @IsBoolean()
    @IsOptional()
    hallDeleted : boolean;

    @IsBoolean()
    @IsOptional()
    hallStatus : boolean;

    @IsUUID()
    @IsOptional()
    hallCreatedBy : any;
}
