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

import * as config from '../config';
import fetch from './fetch';
import joinMonster from 'join-monster';
import { Hashids, Crypto, Permissions } from '../utils';
import { Permission } from '../../shared/permissions';

// tslint:disable-next-line
const GraphQLHashId = Hashids.getGraphQLHashId();

const joinMonsterOptions = { dialect: config.knex.client };

// tslint:disable-next-line
const JWTToken = new GraphQLObjectType({
  description: '',
  name: 'JWTToken',

  fields: () => ({
    token: {
      type: GraphQLString,

      resolve: async (payload: any) => {
        const subject = Hashids.build(config).encode(payload.userId);
        const permissions = await Permissions.getUserPermissions(payload.userId);

        return Crypto.signJWT(subject, { permissions });
      },
    },
  }),
} as any);

export { JWTToken };
