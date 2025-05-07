import {
  BadRequestException,
  Global,
  MiddlewareConsumer,
  Module,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TenantUsersModule } from './modules/tenant-users/tenant-users.module';
import { UserSubscriber } from 'src/entity-subscribers/user.subscriber';
import { CreateDatabaseConnection, findTenant } from 'src/utils/db-utls';
import { GlobalService } from 'src/utils/global.service';
import { initializeCache } from 'memcachelibrarybeta';
import { ErrorMessages } from 'src/utils/messages';

export const TENANT_CONNECTION = 'TENANT_CONNECTION';

const MAX_DB_CONNECTION_DURATION: number =
  parseInt(process.env.MAX_DB_CONNECTION_DURATION) || 60;
class ConnectedDataSource {
  private _interval;
  public status = false;
  constructor(public source: DataSource) {
    if (MAX_DB_CONNECTION_DURATION == -1) return;
    this.startTimer();
  }

  startTimer() {
    this.status = true;
    const durationInMillis = MAX_DB_CONNECTION_DURATION * 1000;
    const lastUpdatedAt = Date.now();
    this._interval = setInterval(() => {
      const currentTime = Date.now();
      const diff = currentTime - lastUpdatedAt;
      if (diff > durationInMillis) {
        clearInterval(this._interval);
        this.source.destroy();
        this.status = false;
      }
    }, 1000);
  }
  restart() {
    clearInterval(this._interval);
    this.startTimer();
  }
}

const ConnectedDataSources: {
  [key: string]: ConnectedDataSource;
} = {};

const skipPaths = ['/auth/login'];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), TenantUsersModule],
  providers: [
    {
      provide: TENANT_CONNECTION,
      inject: [REQUEST, DataSource],
      scope: Scope.REQUEST,
      useFactory: async (request, mainDataSource) => {
        const xTenantId = request.headers['x-tenant-id'] || '';
        const requestPath = request.path;
        if (skipPaths.includes(requestPath)) return mainDataSource;
        else if (xTenantId === '') return mainDataSource;
        else {
          let tenant: Tenant
          if (process.env.MULTI_DOMAIN === "false") {
            tenant = await findTenant(mainDataSource, xTenantId);
          }
          else {
            // console.log(request.headers.host, "request.headers.host");
            tenant = await findTenant(mainDataSource, request.headers.host, 'host');
          }
          const _connection = ConnectedDataSources[tenant.name];
          if (_connection) return _connection.source;
          else return mainDataSource;
        }
      },
    },
  ],
  exports: [TENANT_CONNECTION, TenantUsersModule],
})
export class TenantsModule {
  constructor(
    private readonly mainDataSource: DataSource,
    private configService: ConfigService,
  ) { }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(async (request, response, next) => {

        let tenant: Tenant;
        if (process.env.MULTI_DOMAIN === "false") {
          const xTenantId = request.headers['x-tenant-id'] || '';
          tenant = await findTenant(this.mainDataSource, xTenantId, 'name');
          if (!tenant) {
            throw new BadRequestException(ErrorMessages.TENANT_NOT_FOUND);
          }
        } else {
          const tenantHost = request.headers.host;
          tenant = await findTenant(this.mainDataSource, tenantHost, 'host');
          if (!tenant) {
            throw new BadRequestException(ErrorMessages.TENANT_NOT_FOUND);
          }
        }


        try {
          GlobalService.accountId = tenant._id;
          GlobalService.emailSubscription = tenant.emailSubscription;
          GlobalService.featuresRestrictions = tenant.featuresRestrictions;
          initializeCache(tenant._id);
          if (
            ConnectedDataSources[tenant.name] !== undefined &&
            ConnectedDataSources[tenant.name].status
          ) {
            ConnectedDataSources[tenant.name].source;
            ConnectedDataSources[tenant.name].restart();
            next();
          } else {
            const { dbHost, dbPort, dbUserName, dbPassword } = tenant;
            const options = {
              name: tenant.name,
              database: tenant.name,
              logging: true,
              host: dbHost,
              port: +dbPort,
              username: dbUserName,
              password: dbPassword,
              subscribers: [UserSubscriber],
            };
            const dataSource: DataSource =
              await CreateDatabaseConnection(options);

            if (ConnectedDataSources[tenant.name])
              delete ConnectedDataSources[tenant.name];

            ConnectedDataSources[tenant.name] = new ConnectedDataSource(
              dataSource,
            );
            next();
          }
        } catch (e) {
          throw new BadRequestException(
            ErrorMessages.DATABASE_CONNECTION_ERROR,
          );
        }
      })
      .exclude(...skipPaths)
      .forRoutes('*');
  }
}
