import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql';

import Post from './post';
import { Hashids } from '../utils';

const user = new GraphQLObjectType({
  description: 'a stem contract account',
  name: 'User',

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
    posts: {
      description: 'A list of posts the user has written.',
      type: new GraphQLList(Post),
      orderBy: 'id',

      sqlJoin: (users: string, posts: string) => {
        return `
          ${users}.id = ${posts}.author_id AND
          ${users}.deleted_at IS NULL
        `;
      },
    },
  }),
});

// Set join-monster specific information here as it isn't part of the GraphQL
// interface (this silences typescript errors).
(user as any).sqlTable = 'users';
(user as any).uniqueKey = 'id';

export default user;
