import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    isNotEmpty,
  } from 'class-validator';
  import { Transform } from 'class-transformer';
  import { Hall } from '../entities/hall.entity';
  export class CreateHallDto {
    
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
    @Transform(({ value }) => (value === undefined ? false : value))
    hallDeleted: boolean = false;
  
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => (value === undefined ? true : value))
    hallStatus: boolean = true;
    
    // @IsString()
    // @IsNotEmpty()
    // hallCreatedBy : string;
}

export class HallDto {
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
  @IsNotEmpty()
  hallDeleted : boolean;

  @IsBoolean()
  @IsNotEmpty()
  hallStatus : boolean;
  
  @IsString()
  hallCreatedBy : any;

  @IsNumber()
  scheduleCount: number;

  constructor(hall?: Partial<Hall>, scheduleCount: number = 0) {
    if (hall) {
      this.id = hall.id;
      this.hallExpoId = hall.hallExpoId;
      this.hallName = hall.hallName;
      this.hallDescription = hall.hallDescription;
      this.hallDeleted = hall.hallDeleted;
      this.hallStatus = hall.hallStatus;
      this.hallCreatedBy = hall.hallCreatedBy;
      this.scheduleCount = scheduleCount;
    }
  }
}