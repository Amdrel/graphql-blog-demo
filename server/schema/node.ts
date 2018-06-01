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

import {
  nodeDefinitions,
  fromGlobalId,
} from 'graphql-relay';

import * as config from '../config';
import * as knex from '../database';
import fetch from './fetch';
import joinMonster from 'join-monster';

const joinMonsterOptions = { dialect: config.knex.client };

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId, context, resolveInfo) => {
    const { type, id } = fromGlobalId(globalId);

    return joinMonster.getNode(
      type, resolveInfo, context, parseInt(id, 10),
      (sql: string) => fetch(sql, {}, context), joinMonsterOptions);
  },

  obj => obj.__type__,
);

export { nodeInterface, nodeField };
