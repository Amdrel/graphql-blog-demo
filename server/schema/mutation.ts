import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { User, RegisterUser } from './user';

// tslint:disable-next-line
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Global mutation object.',

  fields: () => ({
    registerUser: RegisterUser,
    // deleteUser: DeleteUser,
    // editUser: EditUser,
  }),
});

export { Mutation };
