import { determineDB, getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column } from 'typeorm';

const databaseType = determineDB();
@Entity({ database: databaseType })
export class Todo extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  roleId: string;
}
