import { GraphQLSchema } from 'graphql';

import queryRoot from './query-root';

export default new GraphQLSchema({
  query: queryRoot,
});
