import { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const remaining = todos.filter((todo) => !todo.done).length;

  return (
    <div className="App">
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

        {todos.length === 0 ? (
          <p className="empty-message">할 일이 없습니다.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.done ? 'done' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span>{todo.text}</span>
                </label>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.length > 0 && (
          <p className="todo-count">남은 할 일: {remaining}개</p>
        )}
      </div>
    </div>
  );
}

export default App;
