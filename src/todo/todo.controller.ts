import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { TodosService } from './todo.service';
import { Public } from 'src/auth/auth.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';


@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) { }

  @Public()
  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.createTodo(createTodoDto);
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    return this.todosService.findOneTodo(_id);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file'))
  uploadFiles(
    @UploadedFiles() file: Express.Multer.File[],
    @Body() body: string,
  ) {

    return { message: 'Files uploaded successfully', data: file };
  }
}
