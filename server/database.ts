import * as Knex from 'knex';
import * as config from './config';

const knex = Knex(config['knex']);

knex.raw(`SELECT 1 + 1 AS result`).then(() => {
  console.log(`Database connection established.`);
}).catch((e: Error) => {
  console.log(e);
});

export = knex;
