import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as graphqlHTTP from 'koa-graphql';
import * as koaConvert from 'koa-convert';
import * as koaStatic from 'koa-static';
import * as middleware from './middleware';
import * as path from 'path';
import defaultSchema from './schema';
import graphiql from 'koa-custom-graphiql';
import { Environment } from './utils';
import { GraphQLError } from 'graphql';
import { Server } from 'http';
import { UserError, ValidationError } from './errors';
import { getLocaleString } from '../shared/localization';
import { logger } from './logging';

const app = new Koa();
const router = new KoaRouter();
const env = Environment.getDeploymentEnv();

router.post('/graphql', koaConvert(graphqlHTTP({
  schema: defaultSchema,

  formatError: (e: GraphQLError) => {
    // Catch custom errors (which are all safe to display).
    if (e.originalError instanceof UserError) {
      return e;
    }

    // This should return GraphQL errors to the client that -don't- include
    // actual internal server errors. GraphQL errors are not very informative in
    // which errors are safe to show to the client and which one aren't.
    //
    // The best we have to go by is checking if another error was thrown that
    // caused the GraphQL error we received.
    if (e.originalError == null) {
      return e;
    }

    // Log stack traces if available to help debug production issues.
    if (e.stack != null) {
      logger.error(e.stack);
    }

    e.message = getLocaleString('InternalError', null);
    return e;
  },
})));

router.redirect('/', '/graphql');

app.use(middleware.jwt);
app.use(router.routes());
app.use(router.allowedMethods());

// Serve the custom build of GraphiQL that shows SQL generation. This should be
// disabled in a production environment to prevent unnessesary leaking of
// information, but keep enabled in QA to reproduce issues.
if (env === Environment.DeploymentEnv.Development ||
    env === Environment.DeploymentEnv.Staging) {
  router.get('/graphql', graphiql({
    css: '/graphiql.css',
    js: '/graphiql.js',
  }));

  app.use(koaStatic(path.join(__dirname, '../../node_modules/graphsiql')));
}

/**
 * Starts the server on the desired port. Database connection pools are shared
 * between all servers and exist for the lifetime of the application.
 */
function startServer(port = process.env.PORT || 3000): Server {
  const server = app.listen(port, () => {
    const address = server.address();
    logger.info(`Listening on port '${address.address}:${address.port}'.`);
  });
  return server;
}

/**
 * Wrapper of http.Server to perform cleanup before closing the server.
 * @param server
 */
function stopServer(server: Server) {
  const address = server.address();
  logger.info(`Manual stop for server on port '${address.address}:${address.port}' requested.`);
  server.close();
}

export { startServer, stopServer };
