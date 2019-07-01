exports.up = function(knex) {
  return knex.schema
    .createTable("users", tbl => {
      tbl.increments();
      tbl.integer("githubId").notNullable();
      tbl.string("name", 255).notNullable();
      tbl.string("username", 255).notNullable();
      tbl.boolean("role").defaultTo(false);
    })
    .createTable("projects", tbl => {
      tbl.increments();
      tbl.string("title").notNullable();
      tbl.string("description").notNullable();
      tbl.integer("participants");
      tbl.string("proposer");
      tbl.string("target_group");
      tbl
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("githubId")
        .inTable("users")
        .onDelete("RESTRICT")
        .onUpdate("CASCADE");
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("users").dropTableIfExists("projects");
};
