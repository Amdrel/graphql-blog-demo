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

// tslint:disable-next-line
const GraphQLHashId = Hashids.getGraphQLHashId();

const joinMonsterOptions = { dialect: config.knex.client };

// tslint:disable-next-line
const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'Global query object.',

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

      where: (users: string) => `${users}.deleted_at IS NULL`,

      resolve: (parent, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },
    },

    user: {
      type: User,
      args: {
        id: {
          description: `The user's unique id.`,
          type: new GraphQLNonNull(GraphQLHashId),
        },
      },

      where: (users: string, args: any, context: any) => {
        return `${users}.id = :id AND ${users}.deleted_at IS NULL`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
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
        const dbCall = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },
    },

    post: {
      type: Post,
      args: {
        id: {
          description: `The post's unique id.`,
          type: new GraphQLNonNull(GraphQLHashId),
        },
      },

      where: (posts: string, args: any, context: any) => {
        return `${posts}.id = :id AND ${posts}.deleted_at IS NULL`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, args, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },
    },
  }),
});

export { Query };
