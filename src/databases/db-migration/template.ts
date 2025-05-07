import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

//@ts-ignore
import entities from '../entities';

config({ path: __dirname + '/./../../../.env' });

const _dbHost = process.env.POSTGRES_HOST;
const _dbPort = parseInt(process.env.POSTGRES_PORT);
const _dbUsername = process.env.POSTGRES_USER;
const _dbPassword = process.env.POSTGRES_PASSWORD;

const migrations = resolve(
  __dirname + '/./../../../databases/db-migration/migrations/<dbname>/*.js',
);

module.exports.default = new DataSource({
  type: 'postgres',
  host: _dbHost,
  port: _dbPort,
  username: _dbUsername,
  password: _dbPassword,
  database: '<dbname>',
  entities: entities,
  migrations: [migrations],
});
