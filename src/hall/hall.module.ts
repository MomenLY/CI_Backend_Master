import { Module } from '@nestjs/common';
import { HallService } from './hall.service';
import { HallController } from './hall.controller';
import { Hall } from './entities/hall.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hall]),CaslModule],
  controllers: [HallController],
  providers: [HallService],
  exports: [HallService],
})
export class HallModule {}
