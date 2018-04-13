import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql';

import * as config from '../config';
import * as knex from '../database';
import { Comment } from './comment';
import { Hashids } from '../utils';
import { User } from './user';

const opts = {
  description: '',
  name: 'Post',
  sqlTable: 'posts',
  uniqueKey: 'id',

  fields: () => ({
    id: {
      description: 'The ID hashid encoded.',
      sqlColumn: 'id',
      type: GraphQLString,

      resolve: (post: any) => Hashids.build(config).encode(post.id),
    },
    ownerId: {
      description: 'The owner ID hashid encoded.',
      sqlColumn: 'owner_id',
      type: GraphQLString,

      resolve: (post: any) => Hashids.build(config).encode(post.id),
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
};

// tslint:disable-next-line
const Post: GraphQLObjectType = new GraphQLObjectType(opts);

export { Post };
