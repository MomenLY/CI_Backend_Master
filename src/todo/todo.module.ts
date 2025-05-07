import { Module } from '@nestjs/common';
import { TodosController } from './todo.controller';
import { TodosService } from './todo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [ 
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename:(req, file, callback) =>{
          const filename = file.originalname;
          callback(null, filename);
        },
      }),
      fileFilter: (req,file, callback)=>{
        callback(null, true);
      },
      limits: {
        fileSize: 20* 1024 * 1024,
      }
    }),
    TypeOrmModule.forFeature([Todo],)],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodoModule {}

