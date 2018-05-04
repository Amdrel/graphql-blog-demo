import {
  GraphQLError,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  RegisterUser,
  AuthenticateUser,
} from './user';

// tslint:disable-next-line
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Global mutation object.',

  fields: () => ({
    registerUser: RegisterUser,
    authenticateUser: AuthenticateUser,
    // deleteUser: DeleteUser,
    // editUser: EditUser,
  }),
});

export { Mutation };
