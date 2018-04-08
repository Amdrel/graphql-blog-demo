exports.up = async function(knex, Promise) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').notNull();
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
    table.increments('id').notNull();
    table.integer('owner_id').notNull();
    table.string('title').notNull();
    table.text('body').notNull();
    table.timestamp('deleted_at');
    table.timestamps(true, true);
    table.foreign('owner_id').references('id').inTable('users');
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
    table.increments('id').notNull();
    table.integer('owner_id').notNull();
    table.integer('post_id').notNull();
    table.text('body').notNull();
    table.timestamp('deleted_at');
    table.timestamps(true, true);
    table.foreign('owner_id').references('id').inTable('users');
    table.foreign('post_id').references('id').inTable('posts');
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
