const db = require("../data/dbConfig.js");

module.exports = {
  add,
  find,
  findById,
  findUser
};

async function add(project) {
  const [projectId] = await db("projects").insert(project, "id");
  return findById(projectId);
}

function find() {
  return db("projects");
}

function findProject(title) {
  return db("projects").where(title);
}

function findById(id) {
  return db("projects")
    .where({ id })
    .first();
}
