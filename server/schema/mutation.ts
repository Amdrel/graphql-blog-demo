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
  EditUser,
  // DeleteUser,
} from './user';

// tslint:disable-next-line
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Global mutation object.',

  fields: () => ({
    registerUser: RegisterUser,
    authenticateUser: AuthenticateUser,
    editUser: EditUser,
    // deleteUser: DeleteUser,
  }),
});

export { Mutation };
