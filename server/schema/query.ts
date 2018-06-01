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
