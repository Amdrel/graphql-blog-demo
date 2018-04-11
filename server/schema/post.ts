// await knex.schema.createTable('posts', (table) => {
//   table.increments('id').notNull();
//   table.integer('owner_id').notNull();
//   table.string('title').notNull();
//   table.text('body').notNull();
//   table.timestamp('deleted_at');
//   table.timestamps(true, true);

//   table.foreign('owner_id')
//     .references('id')
//     .inTable('users')
//     .withKeyName('posts_owner_id_fkey');
// });

import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql';

import Comment from './comment';
import { Hashids } from '../utils';

const post = new GraphQLObjectType({
  description: '',
  name: 'Post',

  fields: () => ({
    id: {
      description: 'The ID hashid encoded.',
      sqlColumn: 'id',
      type: GraphQLString,

      resolve: user => Hashids.getInstance().encode(user.id),
    },
    email: {
      sqlColumn: 'email',
      type: GraphQLString,

      resolve: user => `${user.email}`,
    },
    fullName: {
      description: `A user's full name.`,
      sqlColumn: 'full_name',
      type: GraphQLString,

      resolve: user => `${user.full_name}`,
    },
    firstName: {
      description: `A user's first name.`,
      sqlColumn: 'first_name',
      type: GraphQLString,

      resolve: user => `${user.first_name}`,
    },
    lastName: {
      description: `A user's last name.`,
      sqlColumn: 'last_name',
      type: GraphQLString,

      resolve: user => `${user.last_name}`,
    },
    author: {
      description: 'The user that created the post',
      type: User,

      sqlJoin: (posts, users) => {
        return `${posts}.owner_id = ${users}.id`;
      },
    },
    // posts: {
    //   description: 'A list of posts the user has written.',
    //   type: new GraphQLList(Post),
    //   orderBy: 'id',

    //   sqlJoin: (users: string, posts: string) => {
    //     return `
    //       ${users}.id = ${posts}.author_id AND
    //       ${users}.deleted_at IS NULL
    //     `;
    //   },
    // },
  }),
});

// Set join-monster specific information here as it isn't part of the GraphQL
// interface (this silences typescript errors).
(user as any).sqlTable = 'posts';
(user as any).uniqueKey = 'id';

export default post;
