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
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').notNull();
    table.string('email').notNull();
    table.string('full_name').notNull();
    table.string('first_name').notNull();
    table.string('last_name').notNull();
    table.string('password').notNull();
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });

  // Unique index for email addresses that only applies when the user hasn't
  // been deleted. This allows unreserving an email address when a user
  // deactivates their account so that any future account they create will have
  // data and doesn't inherit whatever they had before.
  await knex.schema.raw(`
    CREATE UNIQUE INDEX users_email_key
    ON users(email)
    WHERE deleted_at IS NULL
  `);

  // Indexes for querying deleted / undeleted users site-wide.
  await knex.schema.raw(`
    CREATE INDEX users_id_undeleted_idx
    ON users(id)
    WHERE deleted_at IS NULL
  `);
  await knex.schema.raw(`
    CREATE INDEX users_id_deleted_idx
    ON users(id)
    WHERE deleted_at IS NOT NULL
  `);

  await knex.schema.createTable('posts', (table) => {
    table.bigIncrements('id').notNull();
    table.integer('owner_id').notNull();
    table.string('title').notNull();
    table.text('body').notNull();
    table.timestamp('deleted_at');
    table.timestamps(true, true);

    table.foreign('owner_id')
      .references('id')
      .inTable('users')
      .withKeyName('posts_owner_id_fkey');
  });

  // Indexes for querying deleted / undeleted posts site-wide.
  await knex.schema.raw(`
    CREATE INDEX posts_id_undeleted_idx
    ON posts(id)
    WHERE deleted_at IS NULL
  `);
  await knex.schema.raw(`
    CREATE INDEX posts_id_deleted_idx
    ON posts(id)
    WHERE deleted_at IS NOT NULL
  `);

  // Indexes for querying deleted / undeleted posts by a user.
  await knex.schema.raw(`
    CREATE INDEX posts_owner_id_undeleted_idx
    ON posts(owner_id)
    WHERE deleted_at IS NULL
  `);
  await knex.schema.raw(`
    CREATE INDEX posts_owner_id_deleted_idx
    ON posts(owner_id)
    WHERE deleted_at IS NOT NULL
  `);

  await knex.schema.createTable('comments', (table) => {
    table.bigIncrements('id').notNull();
    table.integer('owner_id').notNull();
    table.integer('post_id').notNull();
    table.text('body').notNull();
    table.timestamp('deleted_at');
    table.timestamps(true, true);

    table.foreign('owner_id')
      .references('id')
      .inTable('users')
      .withKeyName('comments_owner_id_fkey');
    table.foreign('post_id')
      .references('id')
      .inTable('posts')
      .withKeyName('comments_post_id_fkey');
  });

  // Indexes for querying deleted / undeleted comments by a user.
  await knex.schema.raw(`
    CREATE INDEX comments_owner_id_undeleted_idx
    ON comments(owner_id)
    WHERE deleted_at IS NULL
  `);
  await knex.schema.raw(`
    CREATE INDEX comments_owner_id_deleted_idx
    ON comments(owner_id)
    WHERE deleted_at IS NOT NULL
  `);

  // Indexes for querying deleted / undeleted comments on a post.
  await knex.schema.raw(`
    CREATE INDEX comments_post_id_undeleted_idx
    ON comments(post_id)
    WHERE deleted_at IS NULL
  `);
  await knex.schema.raw(`
    CREATE INDEX comments_post_id_deleted_idx
    ON comments(post_id)
    WHERE deleted_at IS NOT NULL
  `);
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTable('comments');
  await knex.schema.dropTable('posts');
  await knex.schema.dropTable('users');
};
