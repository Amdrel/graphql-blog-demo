import * as GraphQLHashIdType from 'graphql-hashid-type';
import * as HashidsObject from 'hashids';
import * as jwt from 'jsonwebtoken';
import { Permission } from '../shared/permissions';

let graphQLHashIdInstance: any;

export namespace Environment {
  /**
   * Enumeration of all supported deployment environments.
   */
  export enum DeploymentEnv {
    Development = 'development',
    Testing = 'testing',
    Staging = 'staging',
    Production = 'production',
  }

  /**
   * Reads the 'NODE_ENV' environment variable to determine what the current
   * deployment environment is.
   *
   * Certain features may be disabled under certain environments by using the
   * value returned by this function.
   *
   * If no environment is specified, it will be set to 'development'.
   */
  export function getDeploymentEnv(): DeploymentEnv {
    const env: string = (process.env.NODE_ENV || '').toLowerCase();

    if (env === '') {
      return DeploymentEnv.Development;
    }

    if (env === DeploymentEnv.Development) {
      return DeploymentEnv.Development;
    } else if (env === DeploymentEnv.Testing) {
      return DeploymentEnv.Testing;
    } else if (env === DeploymentEnv.Staging) {
      return DeploymentEnv.Staging;
    } else if (env === DeploymentEnv.Production) {
      return DeploymentEnv.Production;
    }

    throw new Error(`Unsupported NODE_ENV specified.`);
  }
}

export namespace Hashids {
  /**
   * Singleton to get a GraphQLHashId type using our hashids config. This
   * function reads the config with a syncronous load so the GraphQL type
   * resolves immediately as they shoud be in the global namespace.
   */
  export function getGraphQLHashId(): any {
    if (graphQLHashIdInstance == null) {
      const config = require('./config');
      graphQLHashIdInstance = buildType(config);
    }
    return graphQLHashIdInstance;
  }

  /**
   * A builder method to get a pre-built hashids object so we don't have to
   * inject the config manully each time it's invoked.
   */
  export function build(config: any): HashidsObject.default {
    // The hashids typescript definition file has errors that make it transpile
    // to javascript incorrectly, even if the type system is happy. Do some
    // black magic to make the type system happy and actually use the right
    // constructor.
    const hashids: HashidsObject.default = new (HashidsObject as any)(
      config.hashids.salt,
      config.hashids.minLength);
    return hashids;
  }

  /**
   * Siliar to build but returns a GraphQL type for coercing pks to id strings.
   * This function returns 'any' for the time being as the library being used
   * doesn't support typescript.
   */
  function buildType(config: any): any {
    return new GraphQLHashIdType.default(
      config.hashids.salt,
      config.hashids.minLength);
  }
}

export namespace Crypto {
  type JWTPayload = string | object | Buffer;

  /**
   * Signs a JWT using crypto options stored in the config.
   */
  export async function signJWT(subject: string, payload?: JWTPayload): Promise<string> {
    const config = await Config.getConfig();
    const algorithm: string = config.jwt.algorithm;

    let realPayload: JWTPayload;
    if (payload == null) {
      realPayload = {};
    } else {
      realPayload = payload;
    }

    return jwt.sign(realPayload, config.jwt.keys[algorithm].private, {
      subject, algorithm,
      audience: config.jwt.audience,
      issuer: config.jwt.issuer,
      expiresIn: config.jwt.expiration,
    });
  }

  /**
   * Verifies a JWT using crypto options stored in the config.
   */
  export async function verifyJWT(token: string): Promise<string | object> {
    const config = await Config.getConfig();
    const algorithm: string = config.jwt.algorithm;

    return jwt.verify(token, config.jwt.keys[algorithm].public, {
      audience: config.jwt.audience,
      issuer: config.jwt.issuer,
      algorithms: [algorithm],
    });
  }
}

export namespace Permissions {
  /**
   * Queries the database for permissions a user has for their assigned roles.
   *
   * @param userId - Primary key of a user to get permissions for.
   */
  export async function getUserPermissions(userId: number): Promise<string[]> {
    const knex = await import ('./database');

    const permissions = await knex('user_roles')
      .distinct('role_permissions.permission')
      .select()
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .innerJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
      .where('user_roles.user_id', '=', userId)
      .orderBy('role_permissions.permission');

    // Permissions are transformed from string -> Permission -> string so that
    // validation is run on permissions retrieved from the database.
    return permissions.map((permission: any) => {
      return new Permission(permission.permission).stringify();
    });
  }
}

export namespace Config {
  /**
   * Imports the config file async. This is useful for most methods that will
   * need to read the config at runtime.
   */
  export async function getConfig(): Promise<any> {
    return await import('./config');
  }
}
