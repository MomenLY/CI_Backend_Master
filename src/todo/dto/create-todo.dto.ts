export class CreateTodoDto {
  user: User[];
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
