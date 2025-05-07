import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import {} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  cName: string;

  @IsNumber()
  @IsNotEmpty()
  cOrder: number;

  @IsOptional()
  @IsString()
  cParentId?: string | null;

  @IsNumber()
  @IsNotEmpty()
  @IsIn([0, 1], { message: 'cStatus must be either 0 or 1' })
  cStatus: number;
}
