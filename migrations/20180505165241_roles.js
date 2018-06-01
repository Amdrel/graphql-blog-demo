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

exports.up = async function(knex, Promise) {
  await knex.schema.createTable('roles', (table) => {
    table.bigIncrements('id').notNull();
    table.string('name').notNull();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('user_roles', (table) => {
    table.bigIncrements('id').notNull();
    table.integer('user_id').notNull();
    table.integer('role_id').notNull();
    table.timestamps(true, true);

    table.foreign('user_id')
      .references('id')
      .inTable('users')
      .withKeyName('user_roles_user_id_fkey');
    table.foreign('role_id')
      .references('id')
      .inTable('roles')
      .withKeyName('user_roles_role_id_fkey');
  });

  await knex.schema.createTable('role_permissions', (table) => {
    table.bigIncrements('id').notNull();
    table.integer('role_id').notNull();
    table.string('permission').notNull();
    table.timestamps(true, true);

    table.foreign('role_id')
      .references('id')
      .inTable('roles')
      .withKeyName('role_permissions_role_id_fkey');
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable('role_permissions');
  await knex.schema.dropTable('user_roles');
  await knex.schema.dropTable('roles');
};
