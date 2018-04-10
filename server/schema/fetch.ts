import * as Knex from 'knex';
import * as knex from '../database';
import { Environment } from '../utils';

/**
 * Wrapper around knex.raw to execute a SQL query. The only difference is
 * X-SQL-Preview will be set in development and staging environments to help
 * with debugging query issues,
 *
 * @param sql
 * @param knex
 * @param context
 */
export default function fetch(sql: string, context: any): Knex.Raw {
  // This is a little trick to help debugging and demo-ing. the client will
  // display whatever is on the X-SQL-Preview header DONT do something like this
  // in production (which is why we check).
  const env = Environment.getDeploymentEnv();
  if (env === Environment.DeploymentEnv.Development ||
      env === Environment.DeploymentEnv.Staging) {
    const value = context.response.get('X-SQL-Preview') +
      '%0A%0A' + sql.replace(/%/g, '%25').replace(/\n/g, '%0A');
    context.set('X-SQL-Preview', value);
  }

  return knex.raw(sql);
}
