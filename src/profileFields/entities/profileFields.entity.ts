import { getIdColumnDecorator } from 'src/utils/helper';
import { Entity, BaseEntity, Column, Index } from 'typeorm';

export enum ColumnType {
  VARCHAR = 'varchar',
  TEXT = 'text',
  DATE = 'date',
  JSON = 'json',
  JSONB = 'jsonb',
  TIMESTAMP = 'timestamp',
  TIME = 'time',
  INTEGER = 'integer'
}

export class FileUploadParams {
  // image: boolean;
  // audio: boolean;
  // video: boolean;
  // document: boolean;
  // zip: boolean;
  fileTypes: string[];
  multiField: boolean
  maxFileSize: string;
}



const databaseType = process.env.DB_TYPE || 'postgres';
@Entity({ database: databaseType, name: 'profileFields' })
@Index(["pFColumName"], { unique: true })
export class ProfileFields extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  pFLabel: string;

  @Column()
  pFType: string;

  @Column({ default: 0 })
  pFOrder: number;

  @Column({ type: 'json', nullable: true })
  pFData: object;

  @Column({ type: 'json', nullable: true })
  pFUploadParams: FileUploadParams;

  @Column()
  pFPlaceholder: string;

  @Column()
  pFHelperText: string;

  @Column()
  pFStatus: number;

  @Column()
  pFFormType: string;

  @Column()
  pFRequired: number;

  @Column()
  pFColumName: string;

  @Column({ default: 0 })
  pFDefault: number

  @Column({
    type: 'enum',
    enum: ColumnType,
    default: ColumnType.VARCHAR
  })
  pFColumType: string;

  @Column({ type: 'json' })
  pFValidation: {
    type: string;
    regexPattern: string;
    errorMessage: string;
  };
}
