process.env.NODE_ENV = 'testing';

import * as Knex from 'knex';
import * as config from '../server/config';
import * as prepare from 'mocha-prepare';
import { Server } from 'http';

// Start a knex connection pool using the config; however the database is
// changed to 'postgres' as the database referenced in the config hasn't been
// created yet.
const bootstrapConfig = JSON.parse(JSON.stringify(config['knex']));
bootstrapConfig.connection.database = 'postgres';
const knex = Knex(bootstrapConfig);

// HTTP server reference that's used to stop the server when tests finish.
let server: Server | undefined;

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
      // present and up-to-date. The pool is also destroyed as new connections
      // must be made in postgres to change databases.
      const realKnex = await import('../server/database');
      await realKnex.migrate.latest();
      await realKnex.destroy();

      // Start the server so integration tests can test mutations and resolvers.
      const { startServer } = await import('../server');
      server = startServer();
    } catch (e) {
      console.error(e);
    } finally {
      done();
    }
  })();
}, (done: Function) => {
  (async () => {
    try {
      const { stopServer } = await import('../server');
      if (server != null) {
        stopServer(server);
      }
    } catch (e) {
      console.error(e);
    } finally {
      done();
    }
  })();
});
