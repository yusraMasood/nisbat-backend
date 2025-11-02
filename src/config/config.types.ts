import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthConfig } from './auth.config';
//import { AuthConfig } from './auth.config';

export interface ConfigType {
  database: TypeOrmModuleOptions;
  auth: AuthConfig;
}

export const appConfigSchema = Joi.object({
  // Either DATABASE_URL or individual DB_* fields must be provided
  DATABASE_URL: Joi.string().uri().optional(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().optional(),
  DB_PASSWORD: Joi.string().optional(),
  DB_DATABASE: Joi.string().optional(),
  DB_SSL: Joi.string().valid('true', 'false').optional(),
  DB_SYNC: Joi.number().valid(0, 1).optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
}).custom((value, helpers) => {
  // Validate that either DATABASE_URL or all individual DB fields are provided
  const hasDatabaseUrl = !!value.DATABASE_URL;
  const hasIndividualFields =
    value.DB_USER && value.DB_PASSWORD && value.DB_DATABASE;

  if (!hasDatabaseUrl && !hasIndividualFields) {
    return helpers.error('any.custom', {
      message:
        'Either DATABASE_URL or all of DB_USER, DB_PASSWORD, and DB_DATABASE must be provided',
    });
  }

  return value;
});
