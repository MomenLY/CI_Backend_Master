import { getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column } from 'typeorm';

const databaseType = process.env.DB_TYPE || 'postgres';
@Entity({ database: databaseType })
export class AccountSettings extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  AsKey: string;

  @Column({ type: 'jsonb' })
  AsSetting: {
    name: string;
    key: string;
    settings: { [key: string]: any };
  };

  @Column()
  AsAccountId: string;
}
