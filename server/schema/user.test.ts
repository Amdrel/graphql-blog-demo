import * as config from '../../server/config';
import { GraphQLInt, GraphQLString } from 'graphql';
import { Hashids, Crypto } from '../utils';
import { PostConnection } from './post';
import { User } from './user';
import { expect } from 'chai';
import { getServer, graphqlQuery } from '../../test/test.bootstrap';

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

  describe('register an account and make profile edits', () => {
    let userId: string;
    let jwtString: string;
    let jwt: any;

    it(`should register accounts`, async () => {
      const app = await getServer();
      const response = await graphqlQuery(app, `
        mutation {
          registerUser(input: {
            email: "john.doe@example.com"
            fullName: " john  doe                    "
            password: "p@$$w0rD"
          }) {
            user {
              id
              fullName
            }
            jwtToken {
              token
            }
          }
        }
      `);

      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('registerUser');
      expect(response.body.data.registerUser).to.have.property('user');
      expect(response.body.data.registerUser).to.have.property('jwtToken');

      const user = response.body.data.registerUser.user;
      expect(user.fullName).to.equal('John Doe');
      expect(user.id).to.be.a('string');
      expect(user.id.length).to.equal(12);
      userId = user.id;

      const jwtToken = response.body.data.registerUser.jwtToken;
      jwtString = jwtToken.token;
      jwt = await Crypto.verifyJWT(jwtString);
      expect(jwt.sub).to.equal(userId);
      expect(jwt.permissions.length).to.equal(0);
    });

    it(`should be able to query the user's public information`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getServer();
      const response = await graphqlQuery(app, `
        query($userId: Hashid!) {
          user(id: $userId) {
            id
            fullName
            email
          }
        }
      `, { userId });

      expect(response.body).to.have.property('errors');
      expect(response.body.errors.length).to.equal(1);
      expect(response.body.errors[0].path).to.deep.equal(['user', 'email']);
      expect(response.body.data).to.have.property('user');

      const user = response.body.data.user;
      expect(user.fullName).to.equal('John Doe');
      expect(user.email).to.equal(null);
      expect(user.id).to.be.a('string');
      expect(user.id.length).to.equal(12);
    });

    it(`should be able to query the user's private information`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getServer();
      const response = await graphqlQuery(app, `
        query($userId: Hashid!) {
          user(id: $userId) {
            id
            fullName
            email
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('user');

      const user = response.body.data.user;
      expect(user.fullName).to.equal('John Doe');
      expect(user.email).to.equal('john.doe@example.com');
      expect(user.id).to.be.a('string');
      expect(user.id.length).to.equal(12);
    });

    // it(`should be able to mutate the user`, async () => {
    //   expect(userId).to.exist;
    //   expect(jwtString).to.exist;
    //   expect(jwt).to.exist;
    // });

    // it(`should be able to deactivate the user`, async () => {
    //   expect(userId).to.exist;
    //   expect(jwtString).to.exist;
    //   expect(jwt).to.exist;
    // });
  });
});
