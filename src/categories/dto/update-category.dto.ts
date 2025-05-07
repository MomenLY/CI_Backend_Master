import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cName: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  cOrder: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cParentId: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1], { message: 'cStatus must be either 0 or 1' })
  cStatus: number;
}
