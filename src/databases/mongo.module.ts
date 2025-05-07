import { Module, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const primaryDBentities = configService.get(
          'PRIMARY_DB_ENTITIES',
        ) as string[];
        const regexPattern = new RegExp(primaryDBentities.join('|'));
        const entities = getMetadataArgsStorage()
          // eslint-disable-next-line @typescript-eslint/ban-types
          .tables.map((tbl) => tbl.target as Function)
          .filter((entity) => {
            return (
              entity.toString().toLowerCase().includes('entity') &&
              regexPattern.test(entity.name)
            );
          });

        return {
          type: 'mongodb',
          url: configService.get('MONGODB_CONNECTION_STRING'),
          database: configService.get('DATABASE_NAME'),
          entities,
          logging: true,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class MongoModule {}
