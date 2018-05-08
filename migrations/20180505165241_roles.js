exports.up = async function(knex, Promise) {
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').notNull();
    table.string('name').notNull();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('user_roles', (table) => {
    table.increments('id').notNull();
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
    table.increments('id').notNull();
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
