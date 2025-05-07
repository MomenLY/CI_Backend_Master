import { Type } from '@nestjs/common';
import { TenantUser } from 'src/tenant/modules/tenant-users/entities/tenant-user.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CreateDatabaseConnection,
  IDENTIFY_TENANT_FROM_PRIMARY_DB,
} from 'src/utils/db-utls';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  getMetadataArgsStorage,
} from 'typeorm';
import { MongoConnectionOptions } from 'typeorm/driver/mongodb/MongoConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor() {}
  // code moved to user.helper.ts
  // beforeUpdate(event: UpdateEvent<User>) {
  //   if (IDENTIFY_TENANT_FROM_PRIMARY_DB) {
  //     let values = null;
  //     event.updatedColumns.forEach((column) => {
  //       if (column.propertyName === 'email') {
  //         values = {
  //           oldEmail: event.databaseEntity[column.propertyName],
  //           newEmail: event.entity[column.propertyName],
  //         };
  //       }
  //     });
  //     if (!values) return;
  //     const entities = getMetadataArgsStorage()
  //       .tables.map((tbl) => tbl.target as Type<any>)
  //       .filter((entity) => {
  //         return entity.toString().toLowerCase().includes('entity');
  //       });
  //     const options: Partial<
  //       PostgresConnectionOptions | MongoConnectionOptions
  //     > = {
  //       name: process.env.DATABASE_NAME,
  //       database: process.env.DATABASE_NAME,
  //       entities: entities,
  //       logging: true,
  //       url: process.env.MONGODB_CONNECTION_STRING,
  //       host: process.env.POSTGRES_HOST,
  //       port: +process.env.POSTGRES_PORT,
  //       username: process.env.POSTGRES_USER,
  //       password: process.env.POSTGRES_PASSWORD,
  //     };
  //     const updateUser = async () => {
  //       const connection = await CreateDatabaseConnection(options);
  //       const TennatUserRepository = connection.getRepository(TenantUser);
  //       const tenantUser = await TennatUserRepository.findOne({
  //         where: { email: values.oldEmail },
  //       });
  //       if (tenantUser) {
  //         tenantUser.email = values.newEmail;
  //         await TennatUserRepository.save(tenantUser);
  //       }
  //       connection.destroy();
  //     };
  //     updateUser();
  //   }
  // }

  // code moved to user.helper.ts
  // afterInsert(event: InsertEvent<User>) {
  //   if (IDENTIFY_TENANT_FROM_PRIMARY_DB) {
  //     const entities = getMetadataArgsStorage()
  //       .tables.map((tbl) => tbl.target as Type<any>)
  //       .filter((entity) => {
  //         return entity.toString().toLowerCase().includes('entity');
  //       });
  //     const options: Partial<
  //       PostgresConnectionOptions | MongoConnectionOptions
  //     > = {
  //       name: process.env.DATABASE_NAME,
  //       database: process.env.DATABASE_NAME,
  //       entities: entities,
  //       logging: true,
  //       url: process.env.MONGODB_CONNECTION_STRING,
  //       host: process.env.POSTGRES_HOST,
  //       port: +process.env.POSTGRES_PORT,
  //       username: process.env.POSTGRES_USER,
  //       password: process.env.POSTGRES_PASSWORD,
  //     };
  //     const saveUser = async () => {
  //       const connection = await CreateDatabaseConnection(options);
  //       const TennatUserRepository = connection.getRepository(TenantUser);
  //       await TennatUserRepository.save({
  //         name: event.entity.firstName + ' ' + event.entity.lastName,
  //         email: event.entity.email,
  //         phone: '',
  //         tenantIdentifier: event.connection.name,
  //       });
  //       connection.destroy();
  //     };
  //     saveUser();
  //   }
  // }

  afterRemove(event: RemoveEvent<any>) {}
}
