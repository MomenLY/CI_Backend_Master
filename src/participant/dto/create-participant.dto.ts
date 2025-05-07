import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsJSON
} from 'class-validator';

export class CreateParticipantDto {
  @IsUUID()
  @IsNotEmpty()
  epUserId: string;

  @IsUUID()
  @IsNotEmpty()
  epExpoId: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'object' ? JSON.stringify(value) : value))
  epUserDetails?: string;

  @IsBoolean()
  @IsOptional()
  epStatus?: boolean;

  @IsString()
  @IsNotEmpty()
  epOrderid: string;

  @IsUUID()
  @IsNotEmpty()
  epCreatedBy: string;

  @IsBoolean()
  @IsOptional()
  epAttendance?: boolean;

  @IsJSON()
  @IsOptional()
  epAttendeeLog?: any;
}

export class ParticipantDto {
  // id: string;
  
  // @IsString()
  // @IsNotEmpty()
  // hallExpoId : string;

  // @IsString()
  // @IsNotEmpty()
  // hallName : string;

  // @IsString()
  // @IsNotEmpty()
  // hallDescription : string;
  
  // @IsBoolean()
  // @IsNotEmpty()
  // hallDeleted : boolean;

  // @IsBoolean()
  // @IsNotEmpty()
  // hallStatus : boolean;
  
  // @IsString()
  // @IsNotEmpty()
  // hallCreatedBy : number;

  // constructor(hall?: Partial<Hall>) {
  //   if (hall) {
  //     this.id = hall.id;
  //     this.hallExpoId = hall.hallExpoId;
  //     this.hallName = hall.hallName;
  //     this.hallDescription = hall.hallDescription;
  //     this.hallDeleted = hall.hallDeleted;
  //     this.hallStatus = hall.hallStatus;
  //     this.hallCreatedBy = hall.hallCreatedBy;
  //   }
  // }
}
