import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import * as bcrypt from '@node-rs/bcrypt';
import { ErrorMessages } from 'src/utils/messages';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private todoRepository: Repository<Todo>,
  ) {}

  async createTodo(createTodoDto: CreateTodoDto) {
    const { user } = createTodoDto;
    const savedUser = [];
    for (const userData of user) {
      const { email, password } = userData;
      const user = await this.todoRepository.findOne({ where: { email } });
      if (user) {
        throw new BadRequestException(ErrorMessages.USER_ALREADY_EXIXTS);
      }

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      userData.password = hash;

      const newUser = await this.todoRepository.save(userData);
      savedUser.push({ ...newUser, password: undefined });
    }
    return savedUser;
  }

  public async findAllTodos(): Promise<Todo[]> {
    return await this.todoRepository.find();
  }

  public async findOneTodo(_id: any): Promise<Todo> {
    return await this.todoRepository.findOne({ where: { _id } });
  }
}
