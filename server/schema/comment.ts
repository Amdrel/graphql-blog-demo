import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql';

import * as config from '../config';
import * as knex from '../database';
import { Hashids } from '../utils';
import { User } from './user';

const opts = {
  description: '',
  name: 'Comment',
  sqlTable: 'comments',
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
  }),
};

// tslint:disable-next-line
const Comment: GraphQLObjectType = new GraphQLObjectType(opts);

export { Comment };
