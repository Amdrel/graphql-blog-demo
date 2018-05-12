import * as Knex from 'knex';
import * as config from './config';
import { logger } from './logging';

const knex = Knex(config['knex']);

// Make sure the pool was initialized by sending a dummy query.
knex.raw(`SELECT 1 + 1 AS result`).then(() => {
  logger.info(`Database connection established.`);
}).catch((e: Error) => {
  logger.error(`Unable to connect to database: ${e.message}`);
});

export = knex;
