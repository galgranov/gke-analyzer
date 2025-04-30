import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // MongoDB Configuration
  MONGODB_URI: Joi.string()
    .required()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .message('MONGODB_URI must be a valid MongoDB connection string'),
  MONGODB_DB_NAME: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .message('MONGODB_DB_NAME must contain only alphanumeric characters, hyphens, and underscores'),

  // MongoDB Connection Options
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: Joi.number().positive().default(10000),
  MONGODB_CONNECT_TIMEOUT_MS: Joi.number().positive().default(15000),
  MONGODB_SOCKET_TIMEOUT_MS: Joi.number().positive().default(45000),
  MONGODB_MAX_POOL_SIZE: Joi.number().positive().default(50),
  MONGODB_MIN_POOL_SIZE: Joi.number().positive().default(5),
  MONGODB_RETRY_WRITES: Joi.boolean().default(true),
  MONGODB_RETRY_READS: Joi.boolean().default(true),

  // API Configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
