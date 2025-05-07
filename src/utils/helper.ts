import { ObjectIdColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PostgresModule } from 'src/databases/postgres.module';
import { MongoModule } from 'src/databases/mongo.module';
import { ValidationArguments, ValidationOptions, isUUID, registerDecorator } from 'class-validator';
import { ObjectId } from 'mongodb';

export const determineDB = () => {
  return process.env.DB_TYPE || 'mongo';
};

export const isMongoDB = (() => determineDB() === 'mongo')();


export const getIdColumnDecorator = () => {
  if (process.env.DB_TYPE === 'postgres') {
    return PrimaryGeneratedColumn('uuid');
  } else {
    return ObjectIdColumn();
  }
};

export const determineDatabaseModule = () => {
  return process.env.DB_TYPE === 'postgres' ? PostgresModule : MongoModule;
};

export function validateMasterDataCollectionObject(o) {
  return Object.values(o).every(item => {
    if (item instanceof Object) {
      return validateMasterDataCollectionObject(item);
    }
    if (typeof item === 'string') {
      return item && item.trim()
    }
    if (typeof item === 'number') {
      return !Number.isNaN(item)
    }
    return true;
  })
}

export function getDurationBetweenDates(startMilliseconds, endMilliseconds) {
  const durationMilliseconds = endMilliseconds - startMilliseconds;
  const durationHours = durationMilliseconds / (1000 * 60 * 60);
  return Math.round(durationHours * 100) / 100;
}

export function ValidateObject(validationOptions?: ValidationOptions) {
  return function(object: any, propertyName: string) {
    registerDecorator({
      name: 'validateObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const oKeys = Object.keys(value).filter(o => o && o.trim());
          const oValues = Object.values(value).filter((o: any) => o && o.trim());
          if(oKeys.length !== oValues.length) {
            return false;
          }
          return true;
        },
      },
    });
  };
}

export function splitArray(arr, size) {
  let chunks = [];
  for (let i = 0; i < Math.ceil(arr.length / size); i++) {
    chunks.push(arr.slice(i * size, i * size + size));
  }
  return chunks;
}

export function IsObjectIdOrUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isObjectIdOrUUID",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {...validationOptions, message: isMongoDB ? `${propertyName} must be an ObjectId` : `${propertyName} must be a UUID`},
      validator: {
        validate(value: any, args: ValidationArguments) {
          return isMongoDB ? ObjectId.isValid(value) : isUUID(value);
        }
      }
    });
  };
}

export function isObjectIdOrUUID(value: any) {
  return isMongoDB ? ObjectId.isValid(value) : isUUID(value);
}