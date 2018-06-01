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
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  connectionDefinitions,
} from 'graphql-relay';

import * as config from '../config';
import * as knex from '../database';
import { Comment } from './comment';
import { Hashids } from '../utils';
import { User } from './user';

// tslint:disable-next-line
const GraphQLHashId = Hashids.getGraphQLHashId();

// tslint:disable-next-line
const Post: GraphQLObjectType = new GraphQLObjectType({
  description: '',
  name: 'Post',
  sqlTable: 'posts',
  uniqueKey: 'id',

  fields: () => ({
    id: {
      description: 'The ID hashid encoded.',
      sqlColumn: 'id',
      type: GraphQLHashId,

      resolve: (post: any) => post.id,
    },
    ownerId: {
      description: 'The owner ID hashid encoded.',
      sqlColumn: 'owner_id',
      type: GraphQLHashId,

      resolve: (post: any) => post.ownerId,
    },
    title: {
      description: `Title to the blog post.`,
      sqlColumn: 'title',
      type: GraphQLString,

      resolve: (post: any) => `${post.title}`,
    },
    body: {
      description: `Body of the blog post.`,
      sqlColumn: 'body',
      type: GraphQLString,

      resolve: (post: any) => `${post.body}`,
    },
    owner: {
      description: 'The user that owns the post',
      type: User,

      sqlJoin: (posts: string, users: string) => {
        return `${posts}.owner_id = ${users}.id`;
      },
    },
    comments: {
      description: 'A list of comments written about the post.',
      type: new GraphQLList(Comment),
      orderBy: 'id',

      sqlBatch: {
        thisKey: 'post_id',
        parentKey: 'id',
      },

      where: (comments: string) => `${comments}.deleted_at IS NULL`,
    },
    commentCount: {
      description: 'The number of comments on a post.',
      type: GraphQLInt,

      sqlExpr: (posts: string) => {
        const query = knex.select(knex.count('*'))
          .from('comments')
          .where('post_id', '=', knex.raw(`${posts}.id`))
          .whereNull('deleted_at');

        // Join monster will add its own SELECT token, so remove the one that
        // knex generates with the query builder.
        const strippedQuery = `${query}`.substring(7);

        return `(${strippedQuery})`;
      },
    },
  }),
} as any);

// tslint:disable-next-line
const { connectionType: PostConnection } = connectionDefinitions({
  nodeType: Post,
});

export { Post, PostConnection };
