import { getIdColumnDecorator } from 'src/utils/helper';
import { AclDto } from '../dto/create-role.dto';
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { boolean } from 'yargs';

const databaseType = process.env.DB_TYPE || 'postgres';

export enum RoleType {
  ADMIN = 'admin',
  ENDUSER = 'enduser',
}

@Entity({ database: databaseType })
export class Role extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: RoleType })
  roleType: RoleType;

  @Column('json')
  acl: AclDto;

  @CreateDateColumn({ nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @Column({nullable: true})
  areIsDefault: number
}
