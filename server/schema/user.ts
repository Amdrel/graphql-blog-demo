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
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLError,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  mutationWithClientMutationId,
} from 'graphql-relay';

import * as argon2 from 'argon2';
import * as config from '../config';
import * as knex from '../database';
import * as validator from 'validator';
import fetch from './fetch';
import joinMonster from 'join-monster';
import { Hashids, Permissions, Utils } from '../utils';
import { JWTToken } from './jwt-token';
import { Post, PostConnection } from './post';
import { UserError, ValidationError, PermissionError } from '../errors';
import { UserValidator } from '../validation/user';
import { getLocaleString } from '../../shared/localization';
import { parseFullName } from 'parse-full-name';

// tslint:disable-next-line
const GraphQLHashId = Hashids.getGraphQLHashId();

const joinMonsterOptions = { dialect: config.knex.client };

// tslint:disable-next-line
const User = new GraphQLObjectType({
  description: '',
  name: 'User',
  sqlTable: 'users',
  uniqueKey: 'id',

  fields: () => ({
    id: {
      description: 'The id hashid encoded.',
      sqlColumn: 'id',
      type: GraphQLHashId,

      resolve: (user: any) => parseInt(user.id, 10),
    },
    email: {
      sqlColumn: 'email',
      type: GraphQLString,

      resolve: (user: any, args: any, ctx: any) => {
        const resolve = () => `${user.email}`;

        if (Permissions.isOwner(ctx, parseInt(user.id, 10))) {
          return resolve();
        } else {
          return Permissions.resolveWithPermissions(resolve, ctx, 'email', 'blog.users.get');
        }
      },
    },
    fullName: {
      description: `A user's full name.`,
      sqlColumn: 'full_name',
      type: GraphQLString,

      resolve: (user: any, args: any, ctx: any) => {
        return `${user.fullName}`;
      },
    },
    firstName: {
      description: `A user's first name.`,
      sqlColumn: 'first_name',
      type: GraphQLString,

      resolve: (user: any, args: any, ctx: any) => {
        return `${user.firstName}`;
      },
    },
    lastName: {
      description: `A user's last name.`,
      sqlColumn: 'last_name',
      type: GraphQLString,

      resolve: (user: any, args: any, ctx: any) => {
        return `${user.lastName}`;
      },
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
} as any);

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
      description: `The user's unhashed password (hashed in storage).`,
    },
  },

  outputFields: {
    user: {
      type: User,

      resolve: (payload, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, { id: payload.userId }, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },

      where: (users: string, args: any, context: any) => {
        return `${users}.id = :id AND ${users}.deleted_at IS NULL`;
      },
    },

    jwtToken: {
      type: JWTToken,

      resolve: (payload, args, context, resolveInfo) => {
        return payload;
      },
    },
  },

  mutateAndGetPayload: async (args, context, resolveInfo): Promise<any> => {
    const userValidator = new UserValidator(context);
    userValidator.validate(args);

    const fullName = parseFullName(args.fullName.trim());
    const hashedPassword = await argon2.hash(args.password, {
      type: argon2.argon2id,
    });

    const data = {
      email: args.email,
      full_name: Utils.stringifyFullName(fullName),
      first_name: fullName.first,
      last_name: fullName.last,
      password: hashedPassword,
    };

    return await knex.transaction(async (tx) => {
      // Check email using an extra SELECT to avoid incrementing the SERIAL
      // sequence with repeated failed attempts.
      const emailResults = await tx('users')
        .select(knex.raw(1))
        .where({ email: args.email, deleted_at: null })
        .limit(1);
      if (emailResults.length > 0) {
        throw new ValidationError({
          message: getLocaleString('EmailClaimedError', context),
        });
      }

      // Register the account and return the id so join monster can query the
      // new account details and deliver them to the client.
      const id = await tx('users').insert(data).returning('id');

      return { userId: parseInt(id[0], 10) };
    });
  },
});

// tslint:disable-next-line
const AuthenticateUser = mutationWithClientMutationId({
  name: 'AuthenticateUser',

  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: `The user's email address.`,
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: `The user's unhashed password (hashed in storage).`,
    },
  },

  outputFields: {
    user: {
      type: User,

      resolve: (payload, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, { id: payload.userId }, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },

      where: (users: string, args: any, context: any) => {
        return `${users}.id = :id AND ${users}.deleted_at IS NULL`;
      },
    },

    jwtToken: {
      type: JWTToken,

      resolve: (payload, args, context, resolveInfo) => {
        return payload;
      },
    },
  },

  mutateAndGetPayload: async (args, context, resolveInfo): Promise<any> => {
    const userValidator = new UserValidator(context);
    userValidator.validate(args);

    // Implementation note: email is checked using an extra SELECT to avoid
    // incrementing the BIGSERIAL sequence with repeated failed attempts.
    return await knex.transaction(async (tx) => {
      const emailResults = await tx('users')
        .select('id', 'password')
        .where({ email: args.email, deleted_at: null })
        .limit(1);
      if (emailResults.length <= 0) {
        throw new ValidationError({
          message: getLocaleString('InvalidAuthorizationInfo', context),
        });
      }

      const user = emailResults[0];
      const verified = await argon2.verify(user.password, args.password);
      if (!verified) {
        throw new ValidationError({
          message: getLocaleString('InvalidAuthorizationInfo', context),
        });
      }

      return { userId: parseInt(user.id, 10) };
    });
  },
});

// tslint:disable-next-line
const EditUser = mutationWithClientMutationId({
  name: 'EditUser',

  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLHashId),
      description: `Unique id of the user to edit.`,
    },
    fullName: {
      type: GraphQLString,
      description: `The user's full name.`,
    },
    oldPassword: {
      type: GraphQLString,
      description: `The user's old unhashed password.`,
    },
    newPassword: {
      type: GraphQLString,
      description: `The user's new unhashed password.`,
    },
  },

  outputFields: {
    user: {
      type: User,

      resolve: (payload, args, context, resolveInfo) => {
        const dbCall = (sql: string) => {
          return fetch(sql, { id: payload.userId }, context);
        };
        return joinMonster(resolveInfo, context, dbCall, joinMonsterOptions);
      },

      where: (users: string, args: any, context: any) => {
        return `${users}.id = :id AND ${users}.deleted_at IS NULL`;
      },
    },
  },

  mutateAndGetPayload: async (args, context, resolveInfo): Promise<any> => {
    const data: any = { updated_at: new Date().toISOString() };
    const owner = Permissions.isOwner(context, args.id);
    const granted = Permissions.checkPermissions(context, 'blog.users.edit');

    if (!owner && !granted) {
      throw new PermissionError(getLocaleString('EditUnauthorized', context));
    }

    const userValidator = new UserValidator(context);
    userValidator.validate(args);

    if (args.fullName != null) {
      const fullName = parseFullName(args.fullName.trim());
      data.full_name = Utils.stringifyFullName(fullName);
      data.first_name = fullName.first;
      data.last_name = fullName.last;
    }

    if (args.newPassword != null) {
      data.password = await argon2.hash(args.newPassword, {
        type: argon2.argon2id,
      });
    }

    return await knex.transaction(async (tx) => {
      const userResults = await tx('users')
        .select('id', 'password')
        .where({ id: args.id, deleted_at: null })
        .limit(1);
      if (userResults.length <= 0) {
        throw new ValidationError({
          message: getLocaleString('EditUserDoesntExist', context),
        });
      }

      const user = userResults[0];

      // Verify that the old password passed matches the current password on
      // record. This check is only done if the password is being changed.
      if (args.oldPassword != null || args.newPassword != null) {
        const verified = await argon2.verify(user.password, args.oldPassword);
        if (!verified) {
          throw new ValidationError({
            message: getLocaleString('PasswordDoesntMatch', context),
          });
        }
      }

      await tx('users').update(data).where({ id: user.id });

      return { userId: parseInt(user.id, 10) };
    });
  },
});

// tslint:disable-next-line
const DeleteUser = mutationWithClientMutationId({
  name: 'DeleteUser',

  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLHashId),
      description: `Unique id of the user to edit.`,
    },
    password: {
      type: GraphQLString,
      description: `The user's old unhashed password.`,
    },
  },

  outputFields: {},

  mutateAndGetPayload: async (args, context, resolveInfo): Promise<any> => {
    const owner = Permissions.isOwner(context, args.id);
    const granted = Permissions.checkPermissions(context, 'blog.users.edit');

    if (!owner && !granted) {
      throw new PermissionError(getLocaleString('DeleteUnauthorized', context));
    }

    const userValidator = new UserValidator(context);
    userValidator.validate(args);

    return await knex.transaction(async (tx) => {
      const userResults = await tx('users')
        .select('id', 'password')
        .where({ id: args.id, deleted_at: null })
        .limit(1);
      if (userResults.length <= 0) {
        throw new ValidationError({
          message: getLocaleString('EditUserDoesntExist', context),
        });
      }

      const user = userResults[0];

      // Verify that the old password passed matches the current password on
      // record. This check is only done if the user editing the resource
      // doesn't have the user edit permission (this means they're editing their
      // own profile).
      //
      // Users with the edit permission will be able to reset other users'
      // passwords at their discretion.
      if (!granted) {
        if (args.password != null) {
          const verified = await argon2.verify(user.password, args.password);
          if (!verified) {
            throw new ValidationError({
              message: getLocaleString('PasswordDoesntMatch', context),
            });
          }
        } else {
          throw new ValidationError({
            message: getLocaleString('PasswordRequired'),
          });
        }
      }

      const now = new Date().toISOString();

      await tx('users').update({
        deleted_at: now,
        updated_at: now,
      }).where({ id: user.id });

      return {};
    });
  },
});

// tslint:disable-next-line
const { connectionType: UserConnection } = connectionDefinitions({
  nodeType: User,
});

export {
  User,
  UserConnection,
  RegisterUser,
  AuthenticateUser,
  EditUser,
  DeleteUser,
};
