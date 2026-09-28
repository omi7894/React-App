import { useEffect, useRef, useState } from 'react';
import './App.css';
import Calendar from './Calendar';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [draggingId, setDraggingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const dragItemIndex = useRef(null);
  const dragOverIndex = useRef(null);

  useEffect(() => {
    fetch('/api/todos')
      .then((res) => {
        if (!res.ok) throw new Error('failed to load todos');
        return res.json();
      })
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('서버에 연결할 수 없습니다. server 폴더에서 "npm start"를 실행해주세요.');
        setLoading(false);
      });
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = async (id) => {
    const todo = todos.find((t) => t.id === id);
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !todo.done }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async (id) => {
    const text = editingText.trim();
    if (!text) {
      cancelEdit();
      return;
    }
    const original = todos.find((t) => t.id === id);
    if (text === original.text) {
      cancelEdit();
      return;
    }
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    cancelEdit();
  };

  const handleDragStart = (index, id) => {
    dragItemIndex.current = index;
    setDraggingId(id);
  };

  const handleDragEnter = (index) => {
    dragOverIndex.current = index;
  };

  const handleDragEnd = () => {
    const from = dragItemIndex.current;
    const to = dragOverIndex.current;
    if (from !== null && to !== null && from !== to) {
      const reordered = [...todos];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      setTodos(reordered);
      fetch('/api/todos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: reordered.map((t) => t.id) }),
      });
    }
    dragItemIndex.current = null;
    dragOverIndex.current = null;
    setDraggingId(null);
  };

  const remaining = todos.filter((todo) => !todo.done).length;

  return (
    <div className="App">
      <div className="app-layout">
        <div className="calendar-panel">
          <Calendar />
        </div>
        <div className="todo-panel">
          <div className="todo-container">
            <h1>TODO</h1>
            <form className="todo-form" onSubmit={addTodo}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="할 일을 입력하세요"
              />
              <button type="submit">추가</button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
              <p className="empty-message">불러오는 중...</p>
            ) : todos.length === 0 ? (
              <p className="empty-message">할 일이 없습니다.</p>
            ) : (
              <ul className="todo-list">
                {todos.map((todo, index) => (
                  <li
                    key={todo.id}
                    className={[
                      todo.done ? 'done' : '',
                      draggingId === todo.id ? 'dragging' : '',
                    ].join(' ').trim()}
                    draggable={editingId !== todo.id}
                    onDragStart={() => handleDragStart(index, todo.id)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="drag-handle" aria-hidden="true">⠿</span>
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    {editingId === todo.id ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(todo.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onBlur={() => saveEdit(todo.id)}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="todo-text"
                        onDoubleClick={() => startEdit(todo)}
                      >
                        {todo.text}
                      </span>
                    )}
                    {editingId !== todo.id && (
                      <div className="todo-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => startEdit(todo)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {todos.length > 0 && (
              <p className="todo-count">남은 할 일: {remaining}개</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
