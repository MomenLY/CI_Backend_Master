import { config } from 'dotenv';
import { writeFile, readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { join, resolve } from 'node:path';

import { exec } from 'child_process';
import { promisify } from 'util';
import {
  createReadStream,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createInterface } from 'node:readline';
import { error } from 'node:console';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const execAsync = promisify(exec);

config({ path: __dirname + '/./../../../.env' });

const dbHost = process.env.POSTGRES_HOST;
const dbPort = parseInt(process.env.POSTGRES_PORT);
const dbUsername = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbName = process.env.DATABASE_NAME;
const dbType = process.env.DB_TYPE;
let TARGET_DB = 'tenant-db';
async function processLineByLine(filePath) {
  try {
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      await rl.close();
      return line;
    }
  } catch (err) {
    throw err;
  }
}

function traverseDirectory(
  currentPath: string,
  files: string[],
  entityFilePaths: string[],
  cb = () => {},
) {
  try {
    if (files.length > 0) {
      const file = files.shift();
      const filePath = join(currentPath, file);
      const stats = statSync(filePath);

      if (stats.isDirectory()) {
        const _files = readdirSync(filePath);
        traverseDirectory(filePath, _files, entityFilePaths, () => {
          traverseDirectory(currentPath, files, entityFilePaths, cb);
        });
      } else {
        if (file.endsWith('.entity.ts')) {
          processLineByLine(filePath).then((fileContent) => {
            if (TARGET_DB === 'tenant-db') {
              if (!fileContent.includes('//@ignore-tenant-migration')) {
                let _path = filePath.replace('src', 'dist');
                _path = _path.replace('.ts', '.js');
                entityFilePaths.push(_path);
              }
            } else {
              if (fileContent.includes('//@ignore-tenant-migration')) {
                let _path = filePath.replace('src', 'dist');
                _path = _path.replace('.ts', '.js');
                entityFilePaths.push(_path);
              }
            }
            traverseDirectory(currentPath, files, entityFilePaths, cb);
          });
        } else traverseDirectory(currentPath, files, entityFilePaths, cb);
      }
    } else cb();
  } catch (e) {
    throw error;
  }
}

function findEntityFilePaths(rootFolderPath): Promise<string[]> {
  const entityFilePaths = [];
  return new Promise((resolve, reject) => {
    try {
      const files = readdirSync(rootFolderPath);
      traverseDirectory(rootFolderPath, files, entityFilePaths, () => {
        resolve(entityFilePaths);
      });
    } catch (err) {
      reject(err);
    }
  });
}

const recurMigrationProcess = async (
  tenants: any[],
  migrationName: string,
  template: string,
  cb = () => {},
) => {
  try {
    if (tenants.length > 0) {
      const client = tenants.shift();
      const _dbName = client.name.toLowerCase();
      await writeFile(
        `${__dirname}/datasources/${_dbName}.js`,
        template.replace(/<dbname>/g, _dbName),
      );
      const { stdout } = await execAsync(
        `npx typeorm migration:generate -o -d ${__dirname}/datasources/${_dbName}.js ${__dirname}/migrations/${_dbName}/${migrationName}`,
      );
      recurMigrationProcess(tenants, migrationName, template, cb);
    } else cb();
  } catch (err) {
    console.log(err)
    recurMigrationProcess(tenants, migrationName, template, cb);
  }
};
const GenerateMigrations = async (migrationName) => {
  try {
    const now = Date.now();

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
      if (tenants.length === 0) {
        process.exit(0);
      }
    } else {
      tenants = [{ name: dbName }];
    }

    try {
      await exec(`mkdir -p ${__dirname}/datasources`);
    } catch (error) {
      throw error;
    }

    try {
      await exec(
        `rm -rf !*.gitkeep ${__dirname}/datasources/* ${__dirname}/migrations/*  ${__dirname}/entities.js`,
      );
    } catch (error) {
      throw error;
    }

    try {
      const rootPath = resolve(__dirname, '../../../src');
      const entities = await findEntityFilePaths(rootPath);
      const filePath = __dirname + '/entities.js';
      const fileContent = `module.exports.default = [
        ${entities.map((path) => `    '${path}',`).join('\n')}
      ];`;

      await writeFileSync(filePath, fileContent);
    } catch (err) {
      throw error;
    }

    try {
      await exec(
        `cp -r ${__dirname}/migrations/* ${__dirname}/oldmigrations/${now}/`,
      );
    } catch (error) {
      throw error;
    }

    const template = await readFile(`${__dirname}/template.js`, 'utf-8');
    recurMigrationProcess(tenants, migrationName, template, () => {
      process.exit(0);
    });
  } catch (error) {
    process.exit(0);
  }
};

const init = async () => {
  try {
    // Check database type
    if (dbType !== 'postgres') {
      process.exit(0);
    }
    // TODO validate migration name. Doesnt include white space
    const argv = await yargs(hideBin(process.argv))
      .option('name', {
        alias: 'n',
        demandOption: true,
        describe: 'name of the migration, eg: --name db-2024-04-28',
        type: 'string',
      })
      .option('target', {
        alias: 't',
        default: 'tenant-db',
        describe: 'Describe the target databases, eg: target=primary-db',
        type: 'string',
        choices: ['primary-db', 'tenant-db'],
      })
      .help().argv;
    TARGET_DB = argv.target || TARGET_DB;
    GenerateMigrations(argv.name);
  } catch (error) {}
};

init();
