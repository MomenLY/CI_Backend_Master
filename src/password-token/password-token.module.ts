import { Module } from '@nestjs/common';
import { PasswordTokenService } from './password-token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordTokens } from './entities/password-token.entity';

@Module({
  imports:[TypeOrmModule.forFeature([PasswordTokens])],
  providers: [PasswordTokenService]
})
export class PasswordTokenModule {}
