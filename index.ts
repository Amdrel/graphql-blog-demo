import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as graphqlHTTP from 'koa-graphql';
import * as koaConvert from 'koa-convert';
import * as koaStatic from 'koa-static';
import * as middleware from './server/middleware';
import * as path from 'path';
import defaultSchema from './server/schema';
import graphiql from 'koa-custom-graphiql';
import { Environment } from './server/utils';
import { GraphQLError } from 'graphql';
import { UserError, ValidationError } from './server/errors';
import { getLocaleString } from './shared/localization';

const app = new Koa();
const router = new KoaRouter();

router.post('/graphql', koaConvert(graphqlHTTP({
  schema: defaultSchema,

  formatError: (e: GraphQLError) => {
    // Catch custom errors (which are all safe to display).
    if (e.originalError instanceof UserError) {
      return e;
    }

    // GraphQL errors are not very informative in which errors are safe to show
    // to the client and which one aren't. What follows is some edge cases that
    // will let certain validation errors leak through to ease frontend
    // development.
    // if (e.message.includes('Field "') &&
    //     e.message.includes('" is not defined by type ')) {
    //   return e;
    // }

    // This should return GraphQL errors to the client that -don't- include
    // actual internal server errors.
    if (e.originalError == null) {
      return e;
    }

    console.error(e.stack);

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
const env = Environment.getDeploymentEnv();
if (env === Environment.DeploymentEnv.Development ||
    env === Environment.DeploymentEnv.Staging) {
  router.get('/graphql', graphiql({
    css: '/graphiql.css',
    js: '/graphiql.js',
  }));

  app.use(koaStatic(path.join(__dirname, '../node_modules/graphsiql')));
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port '${port}'.`);
});
