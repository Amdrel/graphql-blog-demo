import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
} from 'graphql-relay';

import * as config from '../config';
import * as knex from '../database';
import fetch from './fetch';
import joinMonster from 'join-monster';
import { Hashids } from '../utils';
import { Post, PostConnection } from './post';
import { User, UserConnection } from './user';
import { nodeField } from './node';

const joinMonsterOptions = { dialect: config.knex.client };

export default new GraphQLObjectType({
  description: 'Global query object.',
  name: 'Query',

  fields: () => ({
    version: {
      type: GraphQLString,
      resolve: () => (joinMonster as any).version,
    },

    node: nodeField,

    users: {
      description: 'A list of users in the system.',
      type: UserConnection,
      args: connectionArgs,
      sqlPaginate: true,

      sortKey: {
        order: 'DESC',
        key: 'id',
      },

      resolve: (parent, args, context, resolveInfo) => {
        const executor = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, executor, joinMonsterOptions);
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

        const executor = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, executor, joinMonsterOptions);
      },
    },

    posts: {
      description: 'A list of posts in the system.',
      type: PostConnection,
      args: connectionArgs,
      sqlPaginate: true,

      sortKey: {
        order: 'DESC',
        key: 'id',
      },

      where: (posts: string) => `${posts}.deleted_at IS NULL`,

      resolve: (parent, args, context, resolveInfo) => {
        const executor = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, executor, joinMonsterOptions);
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

      where: (posts: string, args: any, context: any) => {
        return `${posts}.id = :id AND ${posts}.deleted_at IS NULL`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        const unencodedId = Hashids.build(config).decode(args.id)[0];
        if (unencodedId != null) {
          args.id = unencodedId;
        } else {
          throw new GraphQLError(`Invalid id format.`);
        }

        const executor = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, executor, joinMonsterOptions);
      },
    },
  }),
});
