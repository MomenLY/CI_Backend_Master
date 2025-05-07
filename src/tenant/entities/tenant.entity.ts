//@ignore-tenant-migration
import { BaseEntity, Column, Entity } from 'typeorm';
import { determineDB, getIdColumnDecorator } from 'src/utils/helper';

interface EmailBody {
  SAuthCode: string;
  SAccountId: string;
  SProviderId: string
}

interface FeatureLimits {
  permission: boolean;
}

interface FeatureRestriction {
  label: string;
  featureKey: string;
  featureLimits: FeatureLimits;
}

const databaseType = determineDB();
@Entity({ database: databaseType })
export class Tenant extends BaseEntity {
  @getIdColumnDecorator()
  _id: string;

  @Column()
  host: string;

  @Column()
  name: string;

  @Column()
  dbHost: string;

  @Column()
  dbPort: string;

  @Column()
  dbUserName: string;

  @Column()
  dbPassword: string;

  @Column({ type: 'json', nullable: true })
  emailSubscription: EmailBody;

  @Column({ type: 'simple-json', nullable: true })
  featuresRestrictions: FeatureRestriction[];
}
