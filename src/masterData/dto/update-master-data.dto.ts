import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateMasterDataDto {
  _id?: string;
  
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mDName?: string;

  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  mDDataCollections?: object;
}
