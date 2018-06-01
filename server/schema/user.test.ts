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

import * as config from '../../server/config';
import { GraphQLInt, GraphQLString } from 'graphql';
import { Hashids, Crypto } from '../utils';
import { PostConnection } from './post';
import { User } from './user';
import { expect } from 'chai';
import { getApp, graphqlQuery } from '../../test/test.bootstrap';

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
      const app = await getApp();
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

      const app = await getApp();
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

      const app = await getApp();
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

    it(`should be able to mutate the user`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();
      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          editUser(input: {
            id: $userId
            fullName: " sanic fast "
          }) {
            user {
              id
              fullName
              email
            }
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('editUser');

      const user = response.body.data.editUser.user;
      expect(user.fullName).to.equal('Sanic Fast');
      expect(user.email).to.equal('john.doe@example.com');
      expect(user.id).to.be.a('string');
      expect(user.id.length).to.equal(12);
    });

    it(`should'nt be able to feed garbage data`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();
      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          editUser(input: {
            id: $userId
            fullName: "f"
          }) {
            user {
              id
              fullName
              email
            }
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.have.property('errors');
      expect(response.body.errors.length).to.equal(1);
    });

    it(`should not allow a password change when the old password is wrong`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      // This password change should fail as the old password provided is not
      // currently on record.
      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          editUser(input: {
            id: $userId
            oldPassword: "iforgot"
            newPassword: "lordofmemes"
          }) {
            user {
              id
              fullName
              email
            }
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.have.property('errors');
      expect(response.body.errors.length).to.equal(1);
    });

    it(`should be able to change the password when the old one matches`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      // This should successfully change the password as the old one that's
      // provided is the one currently on record.
      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          editUser(input: {
            id: $userId
            oldPassword: "p@$$w0rD"
            newPassword: "thebestpasswordyouveeverseen"
          }) {
            user {
              id
              fullName
              email
            }
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.not.have.property('errors');
      expect(response.body.data).to.have.property('editUser');

      const user = response.body.data.editUser.user;
      expect(user.fullName).to.equal('Sanic Fast');
      expect(user.email).to.equal('john.doe@example.com');
      expect(user.id).to.be.a('string');
      expect(user.id.length).to.equal(12);
    });

    it(`should not allow changing the password if the client is not authorized`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      // Make sure only the owner can change a user's password.
      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          editUser(input: {
            id: $userId
            oldPassword: "thebestpasswordyouveeverseen"
            newPassword: "thebestpasswordyouveeverseen"
          }) {
            user {
              id
              fullName
              email
            }
          }
        }
      `, { userId });

      expect(response.body).to.have.property('errors');
      expect(response.body.errors.length).to.equal(1);
    });

    it(`should not be able to deactivate the user if not authorized`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          deleteUser(input: {
            id: $userId
            password: "thebestpasswordyouveeverseen"
          }) {
            clientMutationId
          }
        }
      `, { userId });

      expect(response.body).to.have.property('errors');
      expect(response.body.errors.length).to.equal(1);
    });

    it(`should not be able to deactivate the user if the password is wrong`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          deleteUser(input: {
            id: $userId
            password: "uhhhhh"
          }) {
            clientMutationId
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.have.property('errors');
      expect(response.body.errors.length).to.equal(1);
    });

    it(`should be able to deactivate the user`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      const response = await graphqlQuery(app, `
        mutation($userId: Hashid!) {
          deleteUser(input: {
            id: $userId
            password: "thebestpasswordyouveeverseen"
          }) {
            clientMutationId
          }
        }
      `, { userId }, jwtString);

      expect(response.body).to.not.have.property('errors');
    });

    it(`should not be able to query deactivated users`, async () => {
      expect(userId).to.exist;
      expect(jwtString).to.exist;
      expect(jwt).to.exist;

      const app = await getApp();

      const response = await graphqlQuery(app, `
        query($userId: Hashid!) {
          user(id: $userId) {
            id
            fullName
          }
        }
      `, { userId });

      expect(response.body).to.not.have.property('errors');
      expect(response.body.data.user).to.equal(null);
    });
  });
});
