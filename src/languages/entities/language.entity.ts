import { getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@Index(["LKey", "LLanguage", "LAccountId"], { unique: true })
export class Language extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  LKey: string;

  @Column()
  LDefinition: string;

  @Column({ default: "en" })
  LLanguage: string;

  @Column()
  LAccountId: string;

  @CreateDateColumn({ nullable: true })
  LCreatedAt: Date;

  @UpdateDateColumn({ nullable: true })
  LUpdatedAt: Date;

}
