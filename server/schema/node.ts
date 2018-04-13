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
