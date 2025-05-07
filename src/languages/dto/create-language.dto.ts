import { IsNotEmpty, IsNotEmptyObject, MaxLength, MinLength } from 'class-validator';


export class CreateLanguageDto {
  @IsNotEmptyObject()
  data: {
    [key: string]: string;
  };

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  language: string;

}
