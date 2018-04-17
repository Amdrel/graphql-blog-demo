import * as Knex from 'knex';
import * as config from './config';

const knex = Knex(config['knex']);

// Make sure the pool was initialized by sending a dummy query.
knex.raw(`SELECT 1 + 1 AS result`).then(() => {
  console.log(`Database connection established.`);
}).catch((e: Error) => {
  console.error(`Unable to connect to database: ${e.message}`);
});

export = knex;
