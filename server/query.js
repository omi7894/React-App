const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const db = new DatabaseSync(path.join(__dirname, 'todos.db'));
const sql = process.argv.slice(2).join(' ');

if (!sql) {
  console.error('Usage: node query.js "SELECT * FROM todos"');
  process.exit(1);
}

try {
  const stmt = db.prepare(sql);
  if (/^\s*(select|pragma)/i.test(sql)) {
    console.table(stmt.all());
  } else {
    const info = stmt.run();
    console.log('OK, changes:', info.changes);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
