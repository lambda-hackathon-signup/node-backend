const db = require("../data/dbConfig.js");

module.exports = {
  add,
  find,
  findById,
  findUser
};

async function add(user) {
  const [userId] = await db("users").insert(user, "id");
  return findById(userId);
}

function find() {
  return db("users");
}

function findUser(githubId) {
  return db("users").where(githubId);
}

function findById(id) {
  return db("users")
    .where({ id })
    .first();
}
