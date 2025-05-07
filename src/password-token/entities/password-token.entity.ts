import { determineDB, getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column } from 'typeorm';

const databaseType = determineDB();
@Entity({ database: databaseType, name: 'passwordTokens' })
export class PasswordTokens extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  token: string;

  @Column()
  expiresIn: Date;

  @Column()
  userId: string;

  @Column({ default: false })
  isConsumed: boolean;
}
