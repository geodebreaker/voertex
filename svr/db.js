const fs = require('fs');

async function set(v, s) {
  return JSON.parse(fs.writeFileSync('db.json', s ? v : JSON.stringify(v)));
}

async function get() {
  try {
    return JSON.parse(fs.readFileSync('db.json'));
  } catch (e) { }
}

module.exports = { set, get };