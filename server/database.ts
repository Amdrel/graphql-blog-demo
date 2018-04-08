import * as Knex from 'knex';
import * as config from './config';

const knex = Knex({
  client: 'pg',
  connection: {
    socketPath: '/var/run/postgresql',
    database: 'graphql_blog_demo',
  },
  pool: {
    min: 2,
    max: 10,
  },
});

knex.raw(`SELECT 1 + 1 AS result`).then(() => {
  console.log(`Database connection established.`);
}).catch((e: Error) => {
  console.log(e);
});

export = knex;
