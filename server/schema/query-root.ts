import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLError,
} from 'graphql';

import * as config from '../config';
import * as knex from '../database';
import fetch from './fetch';
import joinMonster from 'join-monster';
import { Hashids } from '../utils';
import { Post } from './post';
import { User } from './user';

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
          description: `The user's unique id.`,
          type: new GraphQLNonNull(GraphQLString),
        },
      },

      where: (usersTable: string, args: any, context: any) => {
        return `${usersTable}.id = :id`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        const unencodedId = Hashids.build(config).decode(args.id)[0];
        if (unencodedId != null) {
          args.id = unencodedId;
        } else {
          throw new GraphQLError(`Invalid id format.`);
        }

        return joinMonster(resolveInfo, context, (sql: string) => {
          return fetch(sql, args, context);
        });
      },
    },

    posts: {
      description: 'A list of posts in the system.',
      type: new GraphQLList(Post),
      orderBy: 'id',

      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster(resolveInfo, context, (sql: string) => {
          return fetch(sql, args, context);
        });
      },
    },

    post: {
      type: Post,
      args: {
        id: {
          description: `The post's unique id.`,
          type: new GraphQLNonNull(GraphQLString),
        },
      },

      where: (postsTable: string, args: any, context: any) => {
        return `${postsTable}.id = :id`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        const unencodedId = Hashids.build(config).decode(args.id)[0];
        if (unencodedId != null) {
          args.id = unencodedId;
        } else {
          throw new GraphQLError(`Invalid id format.`);
        }

        return joinMonster(resolveInfo, context, (sql: string) => {
          return fetch(sql, args, context);
        });
      },
    },
  }),
});
