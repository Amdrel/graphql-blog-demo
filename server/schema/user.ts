import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
} from 'graphql-relay';

import * as config from '../config';
import { Hashids } from '../utils';
import { Post, PostConnection } from './post';

const opts = {
  description: '',
  name: 'User',
  sqlTable: 'users',
  uniqueKey: 'id',

  fields: () => ({
    id: {
      description: 'The id hashid encoded.',
      sqlColumn: 'id',
      type: GraphQLString,

      resolve: (user: any) => Hashids.build(config).encode(user.id),
    },
    email: {
      sqlColumn: 'email',
      type: GraphQLString,

      resolve: (user: any) => `${user.email}`,
    },
    fullName: {
      description: `A user's full name.`,
      sqlColumn: 'full_name',
      type: GraphQLString,

      resolve: (user: any) => `${user.fullName}`,
    },
    firstName: {
      description: `A user's first name.`,
      sqlColumn: 'first_name',
      type: GraphQLString,

      resolve: (user: any) => `${user.firstName}`,
    },
    lastName: {
      description: `A user's last name.`,
      sqlColumn: 'last_name',
      type: GraphQLString,

      resolve: (user: any) => `${user.lastName}`,
    },
    posts: {
      description: 'A list of posts the user has written.',
      type: PostConnection,
      args: connectionArgs,
      sqlPaginate: true,

      sortKey: {
        order: 'DESC',
        key: 'id',
      },

      sqlJoin: (users: string, posts: string) => {
        return `
          ${users}.id = ${posts}.owner_id AND
          ${users}.deleted_at IS NULL`;
      },
    },
  }),
};

// tslint:disable-next-line
const User: GraphQLObjectType = new GraphQLObjectType(opts);

// tslint:disable-next-line
const { connectionType: UserConnection } = connectionDefinitions({
  nodeType: User,
});

export { User, UserConnection };
