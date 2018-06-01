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
export default function fetch(sql: string, args: any, context: any): Knex.Raw {
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

  return knex.raw(sql, args);
}
