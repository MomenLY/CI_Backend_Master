import { getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column } from 'typeorm';

const databaseType = process.env.DB_TYPE || 'postgres';
@Entity({ database: databaseType, name: 'masterData' })
export class MasterData extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  mDName: string;

  @Column({ unique: true })
  mDKey: string;

  @Column({ type: 'json' })
  mDDataCollections: object;
}
