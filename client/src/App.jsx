import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilter from "./components/TaskFilter.jsx";
import TaskList from "./components/TaskList.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PAGE_SIZE = 6;

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(`${API_URL}/tasks`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load tasks.");
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  async function addTask(title) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add task.");
      setTasks(previous => [data, ...previous]);
      setPage(1);
    } catch (err) { setError(err.message); }
  }

  async function toggleTask(id) {
    try {
      setError("");
      const current = tasks.find(task => task._id === id);
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current.completed })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update task.");
      setTasks(previous => previous.map(task => task._id === id ? data : task));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete task.");
      setTasks(previous => previous.filter(task => task._id !== id));
    } catch (err) { setError(err.message); }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });
  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const remainingTasks = tasks.filter(task => !task.completed).length;

  return (
    <main className="app-shell">
      <section className="task-card">
        <header className="app-header">
          <div>
            <p className="eyebrow">MSTCONNECT PH • CAPSTONE 3</p>
            <h1>Task Manager</h1>
            <p className="subtitle">Add, complete, delete, and filter your tasks.</p>
          </div>
          <div className="task-summary"><strong>{remainingTasks}</strong><span>remaining</span></div>
        </header>

        <TaskForm onAddTask={addTask} />
        {error && <div className="error-message">{error}</div>}
        <TaskFilter filter={filter} onFilterChange={nextFilter => { setFilter(nextFilter); setPage(1); }} />

        {loading ? <div className="status-message">Loading tasks...</div> :
          <>
            <TaskList tasks={visibleTasks} onToggle={toggleTask} onDelete={deleteTask} />
            {filteredTasks.length > PAGE_SIZE && (
              <nav className="pagination" aria-label="Task pages">
                <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>Page {currentPage} of {pageCount}</span>
                <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>
                  Next
                </button>
              </nav>
            )}
          </>}
      </section>
    </main>
  );
}
export default App;