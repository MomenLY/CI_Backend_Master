import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateMasterDataDto {
  @IsString()
  @IsNotEmpty()
  mDName: string;
  @IsObject()
  @IsNotEmpty()
  mDDataCollections: object;
}
