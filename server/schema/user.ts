import {
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  mutationWithClientMutationId,
} from 'graphql-relay';

import * as config from '../config';
import * as knex from '../database';
import fetch from './fetch';
import joinMonster from 'join-monster';
import { Hashids } from '../utils';
import { Post, PostConnection } from './post';
import { getLocaleString } from '../localization';

// tslint:disable-next-line
const GraphQLHashId = Hashids.getGraphQLHashId();

const joinMonsterOptions = { dialect: config.knex.client };

const opts = {
  description: '',
  name: 'User',
  sqlTable: 'users',
  uniqueKey: 'id',

  fields: () => ({
    id: {
      description: 'The id hashid encoded.',
      sqlColumn: 'id',
      type: GraphQLHashId,

      resolve: (user: any) => user.id,
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
const User = new GraphQLObjectType(opts);

// tslint:disable-next-line
const RegisterUser = mutationWithClientMutationId({
  name: 'RegisterUser',

  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: `The user's email address.`,
    },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      description: `The user's full name.`,
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: `The user's unhashed name (hashed in storage).`,
    },
  },

  outputFields: {
    user: {
      type: User,

      where: (users: string, args: any, context: any) => {
        return `${users}.id = :id AND ${users}.deleted_at IS NULL`;
      },

      resolve: (parent, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, { id: parent.id }, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },
    },
  },

  mutateAndGetPayload: async (args, context, resolveInfo): Promise<any> => {
    const data = {
      email: args.email,
      full_name: args.fullName,
      first_name: 'First',
      last_name: 'Last',
      password: 'tmp',
    };

    const query = knex('users').insert(data).returning('id');

    return query.then((id) => {
      return { id: id[0] };
    }).catch((e) => {
      if (e.code === '23505') {
        if (e.constraint === 'users_email_key') {
          throw new Error(getLocaleString('EmailClaimedError'));
        }
      }

      throw new Error(getLocaleString(`InternalError`));
    });
  },
});

// tslint:disable-next-line
const { connectionType: UserConnection } = connectionDefinitions({
  nodeType: User,
});

export { User, UserConnection, RegisterUser };
