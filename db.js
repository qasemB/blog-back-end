const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { nanoid } = require('nanoid');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Set default data structure
db.defaults({
  categories: [],
  articles: [],
  comments: []
}).write();

module.exports = {
  db,
  createId: () => nanoid(10)
}; 