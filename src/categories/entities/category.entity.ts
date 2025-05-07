import { getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column } from 'typeorm';

const databaseType = process.env.DB_TYPE || 'postgres';
@Entity({ database: databaseType, name: 'categories' })
export class Category extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  cName: string;

  @Column()
  cOrder: number;

  @Column({ nullable: true })
  cParentId: string;

  @Column()
  cStatus: number;
}
