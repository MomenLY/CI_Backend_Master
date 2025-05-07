# Onion-backend

This project is created with the [NestJS](https://github.com/nestjs/nest) framework. Therefore, please ensure that [nest-cli](https://docs.nestjs.com/cli/overview) is installed on your system before beginning development.

## Installation

```bash
$ npm install
```

Duplicate the example.env file as .env


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Multi-tenancy(SASS)
To enable multi-tenancy in the application, set the `SASS_APP` environment variable to `true` in the .env file.

## Database

Project is designed with flexibility in mind, allowing you to choose between MongoDB and PostgreSQL as your database management system. Here’s how you can configure your environment to suit your database preferences and setup requirements:

### Database Selection via Environment Variable
Determine which database system the project will utilize by setting the `DB_TYPE` environment variable. Specify mongodb for MongoDB or postgres for PostgreSQL, depending on which database system you prefer to work with.

### Database Credentials and Configuration
All necessary database credentials and configurations are managed through the .env file. Make sure to properly set up your .env file with the required database credentials, including the host, port, username, and password.

### Database Name Configuration:

- **Non-SaaS Applications**

If your application is not a Software as a Service (SaaS) application, directly provide the actual name of your database by setting the `DATABASE_NAME` environment variable in the .env file.

- **SaaS Applications**

For SaaS applications, it's important to specify the super admin database name by setting the DATABASE_NAME environment variable. The super admin database should be have a collection/table `tenant` with a feild `host`. The host feild type must be a string. 

There is a provider called **TENANT_CONNECTION** that implements dynamic database connectivity for SaaS applications. These connections will be closed after a specific period if no operations are performed through this connection. The duration can be configured using the environment variable `MAX_DB_CONNECTION_DURATION`.

If you want to configure an entity in the tenant database, you should add or modify the line of code in the constructor of that particular entity's service as shown below. 

[[entity]].service.ts
```
   export class UsersService {
        ........
        constructor(
            @InjectRepository(User) private userRepository: Repository<User>,
            @InjectRepository(User) private mongoUserRepository: MongoRepository<User>,
            private jwtService: JwtService,
        ) {}
        .......
        ......
    }
```
Change to

```
    export class UsersService {
        .....
        private userRepository: Repository<User> & MongoRepository<User>;
        ........
        constructor(@Inject(TENANT_CONNECTION) private connection) {
            this.userRepository = this.connection.getRepository(User);
        }
        .......
        ......
    }

```
Otherwise, the entity will reside in the main database.

To ensure proper handling of tenant-based API calls, it's essential to append the x-tenant-id header to every request. Here's an example:
```
    curl --location 'localhost:4000/user' \
    --header 'x-tenant-id: dell' \
    --header 'Authorization: Bearer <JWT Token>'
``` 

In this case, "dell" serves as the tenant identifier. For MongoDB setups, the database is created automatically. However, when using PostgreSQL, manual creation of the "dell" database is required.