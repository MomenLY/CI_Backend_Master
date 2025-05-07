import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

config({ path: __dirname + '/./../../../.env' });
const execAsync = promisify(exec);
const dbHost = process.env.POSTGRES_HOST;
const dbPort = parseInt(process.env.POSTGRES_PORT);
const dbUsername = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbName = process.env.DATABASE_NAME;
const dbType = process.env.DB_TYPE;
let TARGET_DB = 'tenant-db';
const recurMigrationProcess = async (tenants: any[], cb = () => {}) => {
  try {
    if (tenants.length > 0) {
      const client = tenants.shift();
      const _dbName = client.name.toLowerCase();
      const { stdout } = await execAsync(
        `npx typeorm migration:run -d ${__dirname}/datasources/${_dbName}.js`,
      );
      recurMigrationProcess(tenants, cb);
    } else cb();
  } catch (err) {
    throw err;
  }
};
const RunMigration = async () => {
  try {
    let tenants: any = [];
    if (TARGET_DB === 'tenant-db') {
      let pool = new Pool({
        user: dbUsername,
        host: dbHost,
        database: dbName,
        password: dbPassword,
        port: dbPort,
      });
      const res = await pool.query('SELECT * FROM tenant');
      tenants = res.rows;
      await pool.end();
      pool = null;
    } else {
      tenants = [{ name: dbName }];
    }
    recurMigrationProcess(tenants, () => {
      process.exit(0);
    });
  } catch (error) {
    process.exit(0);
  }
};
const init = async () => {
  try {
    if (dbType !== 'postgres') {
      process.exit(0);
    }

    const argv = await yargs(hideBin(process.argv))
      .option('target', {
        alias: 't',
        default: 'tenant-db',
        describe: 'Describe the target databases, eg: target=primary-db',
        type: 'string',
        choices: ['primary-db', 'tenant-db'],
      })
      .help().argv;
    TARGET_DB = argv.target || TARGET_DB;
    RunMigration();
  } catch (error) {}
};

init();
