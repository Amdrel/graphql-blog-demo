import { GraphQLInt, GraphQLString } from 'graphql';
import { Hashids } from '../utils';
import { PostConnection } from './post';
import { User } from './user';
import { expect } from 'chai';

// tslint:disable-next-line
const GraphQLHashId = Hashids.getGraphQLHashId();

describe('user resource querying and mutations', () => {
  describe('ensure user fields are present for backwards compatibility', () => {
    it(`should have an 'id' field`, () => {
      expect(User.getFields()).to.have.property('id');
      expect(User.getFields().id.type).to.deep.equals(GraphQLHashId);
    });

    it(`should have an 'email' field`, () => {
      expect(User.getFields()).to.have.property('email');
      expect(User.getFields().email.type).to.deep.equals(GraphQLString);
    });

    it(`should have an 'fullName' field`, () => {
      expect(User.getFields()).to.have.property('fullName');
      expect(User.getFields().fullName.type).to.deep.equals(GraphQLString);
    });

    it(`should have an 'firstName' field`, () => {
      expect(User.getFields()).to.have.property('firstName');
      expect(User.getFields().firstName.type).to.deep.equals(GraphQLString);
    });

    it(`should have an 'lastName' field`, () => {
      expect(User.getFields()).to.have.property('lastName');
      expect(User.getFields().lastName.type).to.deep.equals(GraphQLString);
    });

    it(`should have an 'posts' field`, () => {
      expect(User.getFields()).to.have.property('posts');
      expect(User.getFields().posts.type).to.deep.equals(PostConnection);
    });
  });
});
