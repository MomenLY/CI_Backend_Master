import { IsArray, IsNotEmpty, MaxLength, MinLength } from 'class-validator';


export class DeleteLanguageDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  keys: string[];

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  language: string;
}
