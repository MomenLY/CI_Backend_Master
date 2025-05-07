import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(256)
  password: string;
}
