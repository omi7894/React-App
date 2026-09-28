const express = require('express');
const path = require('node:path');
const db = require('./db');

const app = express();
app.use(express.json());

const rowToTodo = (row) => ({
  id: row.id,
  text: row.text,
  done: Boolean(row.done),
  position: row.position,
});

app.get('/api/todos', (req, res) => {
  const rows = db.prepare('SELECT * FROM todos ORDER BY position ASC').all();
  res.json(rows.map(rowToTodo));
});

app.post('/api/todos', (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }
  const { maxPosition } = db
    .prepare('SELECT COALESCE(MAX(position), -1) AS maxPosition FROM todos')
    .get();
  const info = db
    .prepare('INSERT INTO todos (text, done, position) VALUES (?, 0, ?)')
    .run(text, maxPosition + 1);
  const row = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json(rowToTodo(row));
});

app.patch('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  const done =
    req.body.done !== undefined ? (req.body.done ? 1 : 0) : existing.done;
  const text =
    req.body.text !== undefined ? String(req.body.text).trim() : existing.text;
  db.prepare('UPDATE todos SET done = ?, text = ? WHERE id = ?').run(
    done,
    text,
    id
  );
  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(rowToTodo(row));
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.status(204).end();
});

app.patch('/api/todos/reorder', (req, res) => {
  const order = req.body.order;
  if (!Array.isArray(order)) {
    res.status(400).json({ error: 'order must be an array of ids' });
    return;
  }
  const update = db.prepare('UPDATE todos SET position = ? WHERE id = ?');
  db.exec('BEGIN');
  try {
    order.forEach((id, index) => update.run(index, id));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  const rows = db.prepare('SELECT * FROM todos ORDER BY position ASC').all();
  res.json(rows.map(rowToTodo));
});

const buildDir = path.join(__dirname, '..', 'build');
app.use(express.static(buildDir));
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
