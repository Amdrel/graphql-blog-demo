process.env.NODE_ENV = 'testing';

import * as Knex from 'knex';
import * as config from '../server/config';
import * as prepare from 'mocha-prepare';

const bootstrapConfig = JSON.parse(JSON.stringify(config['knex']));
bootstrapConfig.connection.database = 'postgres';

const knex = Knex(bootstrapConfig);

prepare((done: Function) => {
  (async () => {
    try {
      const dbexists = (await knex.raw(
        `SELECT 1 FROM pg_database WHERE datname=:dbname`,
        { dbname: config.knex.connection.database })).rowCount > 0;

      // Remove the test database if one is already present from a previous test
      // run, then create the new one once we know there isn't one.
      //
      // Also note that prepared params are not used since Postgres doesn't
      // support it with DROP or CREATE from what I'm aware;
      if (dbexists) {
        await knex.raw(`DROP DATABASE ${config.knex.connection.database}`);
      }
      await knex.raw(`CREATE DATABASE ${config.knex.connection.database}`);

      // Run database migrations on the new database to ensure the schema is
      // present and up-to-date.
      const realKnex = await import('../server/database');
      await realKnex.migrate.latest();
    } catch (e) {
      console.error(e);
    } finally {
      done();
    }
  })();
});
