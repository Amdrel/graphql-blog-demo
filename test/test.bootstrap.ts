// MIT License
//
// Copyright (c) 2018 Walter Kuppens
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

process.env.NODE_ENV = 'testing';

import * as Knex from 'knex';
import * as config from '../server/config';
import * as prepare from 'mocha-prepare';
import * as request from 'request-promise';
import { Server } from 'http';

// HTTP server reference that's used to stop the server when tests finish.
let server: Server | undefined;

interface GraphQLVariables {
  [name: string]: any;
}

/**
 * Silly function that polls for 'server' to be non-null. This defers null
 * checking in integration tests here so tests are easier to read.
 *
 * Ideally the polling should never happen since bootstrap is always called
 * first. This is more of a failsafe in-case that doesn't happen due to changes
 * in the mocha configuration.
 */
export async function getApp(): Promise<Server> {
  const maxAttempts = 50;
  let attempts = 0;

  while (server == null) {
    attempts += 1;
    if (attempts > maxAttempts) {
      throw new Error(`Server hasn't started in 5 seconds, stopping...`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return server;
}

/**
 * Executes a local GraphQL query. This function is used by integration tests
 * to test mutations and resolvers using a live testing database.
 *
 * @param app HTTP server object for the running server (to get port info).
 * @param query Raw GraphQL query to execute on the server.
 */
export async function graphqlQuery(
    app: Server, query: string, variables?: GraphQLVariables,
    authorization?: string): Promise<any> {
  const headers: any = {};

  if (authorization != null) {
    headers['Authorization'] = authorization;
  }

  return request({
    headers,
    baseUrl: `http://localhost:${app.address().port}`,
    method: 'POST',
    uri: '/graphql',
    body: { query, variables },
    resolveWithFullResponse: true,
    json: true,
  });
}

// Hooks that migrate the test database and start the GraphQL server for
// integration testing before mocha starts.
prepare((done: Function) => {
  (async () => {
    try {
      // Start a knex connection pool using the config; however the database is
      // changed to 'postgres' as the database referenced in the config hasn't
      // been created yet.
      const bootstrapConfig = JSON.parse(JSON.stringify(config['knex']));
      bootstrapConfig.connection.database = 'postgres';
      const knex = Knex(bootstrapConfig);

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
      if (server != null) {
        const { stopServer } = await import('../server');
        stopServer(server);
      }
    } catch (e) {
      console.error(e);
    } finally {
      done();
    }
  })();
});
