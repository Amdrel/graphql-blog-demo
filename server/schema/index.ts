import { GraphQLSchema } from 'graphql';
import { Mutation } from './mutation';
import { Query } from './query';

export default new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});
