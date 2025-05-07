//@ignore-tenant-migration
import { BaseEntity, Column, Entity } from 'typeorm';
import { determineDB, getIdColumnDecorator } from 'src/utils/helper';

const databaseType = determineDB();

@Entity({ database: databaseType })
export class TenantUser extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  tenantIdentifier: string;

  @Column()
  userId: string;
}
