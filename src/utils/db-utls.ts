import { Tenant } from 'src/tenant/entities/tenant.entity';
import { REPLACE_ID, TENANT_CHACHE_KEY } from './cache-keys';
import { getCache } from 'memcachelibrarybeta';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import { DataSource, getMetadataArgsStorage } from 'typeorm';
import { Type } from '@nestjs/common';
import { isMongoDB } from './helper';

export const IDENTIFY_TENANT_FROM_PRIMARY_DB =
  process.env.IDENTIFY_TENANT_FROM_PRIMARY_DB === 'true';
export const findTenant = async (
  connection: DataSource,
  xTenantId: string,
  key = 'name',
): Promise<Tenant | null> => {

  const getTenant = async (info: { name: string, key: string }): Promise<Tenant | null> => {
    const { name, key } = info
    let filter = { where: { [key]: name } };
    const tenant: Tenant = await connection
      .getRepository(Tenant)
      .findOne(filter);
    return tenant;
  };

  if (process.env.NODE_ENV === 'development') {
    return await getTenant({ name: xTenantId, key });
  }
  const tenant: Tenant = await getCache(
    TENANT_CHACHE_KEY.replace(REPLACE_ID, xTenantId),
    getTenant,
    { name: xTenantId, key },
  );
  return tenant;
};

export const CreateDatabaseConnection = async (
  options: Partial<PostgresConnectionOptions | MongoConnectionOptions>,
): Promise<DataSource> => {
  let dataSource: DataSource;
  const entities = getMetadataArgsStorage()
    .tables.map((tbl) => tbl.target as Type<any>)
    .filter((entity) => {
      return entity.toString().toLowerCase().includes('entity');
    });
  let mongoString = process.env.MONGODB_CONNECTION_STRING;
  const { host, port, username, password } = options;
  if (host && port) {
    if (username && password) {
      mongoString = `mongodb://${username}:${password}@${host}:${port}`;
    } else mongoString = `mongodb://${host}:${port}`;
  }
  if (isMongoDB) {
    dataSource = new DataSource({
      name: options.name,
      type: 'mongodb',
      url: mongoString,
      database: options.name,
      entities: options.entities || entities,
      logging: true,
      subscribers: options.subscribers || [],
    });
  } else {
    dataSource = new DataSource({
      name: options.name,
      type: 'postgres',
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      database: options.database,
      entities: options.entities || entities,
      logging: false,
      subscribers: options.subscribers || [],
    });
  }
  await dataSource.initialize();
  return dataSource;
};
