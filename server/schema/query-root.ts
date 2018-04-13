import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import * as knex from '../database';
import { User } from './user';
import fetch from './fetch';
import joinMonster from 'join-monster';

export default new GraphQLObjectType({
  description: 'Global query object.',
  name: 'Query',

  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => (joinMonster as any).version,
    },

    users: {
      description: 'A list of users in the system.',
      type: new GraphQLList(User),
      orderBy: 'id',

      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, context, (sql: string) => {
          return fetch(sql, args, context);
        });
      },
    },

    user: {
      type: User,
      args: {
        id: {
          description: 'The users ID number',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },

      where: (usersTable: string, args: any, context: any) => {
        return `${usersTable}.id = :id`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, context, (sql: string) => {
          return fetch(sql, args, context);
        });
      },
    },
  }),
});
