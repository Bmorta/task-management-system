import { useEffect, useMemo, useState } from "react";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilter from "./components/TaskFilter.jsx";
import TaskList from "./components/TaskList.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PAGE_SIZE = 6;
const USER_NAME = "Brigitte";

function dateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function shortDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value));
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_URL}/tasks`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load tasks.");
        setTasks(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function saveTask(form) {
    try {
      setError("");
      const editing = Boolean(form._id);
      const response = await fetch(editing ? `${API_URL}/tasks/${form._id}` : `${API_URL}/tasks`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, priority: form.priority, dueDate: form.dueDate || null })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save task.");
      setTasks(previous => editing ? previous.map(task => task._id === data._id ? data : task) : [data, ...previous]);
      setModal(null);
      setEditingTask(null);
      setPage(1);
    } catch (err) { setError(err.message); }
  }

  async function toggleTask(id) {
    try {
      const current = tasks.find(task => task._id === id);
      if (!current) return;
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

  async function deleteTask() {
    if (!modal?.task) return;
    try {
      const response = await fetch(`${API_URL}/tasks/${modal.task._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete task.");
      setTasks(previous => previous.filter(task => task._id !== modal.task._id));
      setModal(null);
    } catch (err) { setError(err.message); }
  }

  const stats = useMemo(() => {
    const completed = tasks.filter(task => task.completed).length;
    const overdue = tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < new Date()).length;
    return { total: tasks.length, completed, active: tasks.length - completed, overdue };
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = tasks.filter(task => {
      const status =
        filter === "Active" ? !task.completed :
        filter === "Completed" ? task.completed :
        filter === "Overdue" ? (!task.completed && task.dueDate && new Date(task.dueDate) < new Date()) : true;
      const text = `${task.title} ${task.description || ""}`.toLowerCase().includes(q);
      return status && text;
    });
    return [...result].sort((a,b) => {
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "priority") return ({High:0,Medium:1,Low:2}[a.priority] ?? 1) - ({High:0,Medium:1,Low:2}[b.priority] ?? 1);
      if (sort === "due") return (a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31")) - (b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31"));
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [tasks, filter, search, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="app-shell">
      <nav className="navbar">
        <div className="brand"><div className="brand-logo">✓</div><div><strong>TaskFlow</strong><span>Task Management System</span></div></div>
        <div className="nav-user"><div><strong>Hello, {USER_NAME}!</strong><span>{dateTime(now)}</span></div><button onClick={() => setModal({type:"form"})}>＋ Add Task</button></div>
      </nav>

      <section className="dashboard">
        <header className="hero">
          <div><p className="eyebrow">MY WORKSPACE</p><h1>Stay organized.<br/><em>Get things done.</em></h1><p>Plan your work, track progress, and keep every task in one place.</p></div>
          <div className="progress-card"><div className="progress-circle" style={{"--progress": stats.total ? (stats.completed / stats.total) * 100 : 0}}><strong>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</strong><span>complete</span></div><div><strong>{stats.completed} of {stats.total}</strong><span>tasks completed</span></div></div>
        </header>

        <div className="stats-grid">
          <div className="stat"><b>▦</b><div><strong>{stats.total}</strong><span>Total Tasks</span></div></div>
          <div className="stat"><b>◷</b><div><strong>{stats.active}</strong><span>Active</span></div></div>
          <div className="stat"><b>✓</b><div><strong>{stats.completed}</strong><span>Completed</span></div></div>
          <div className="stat"><b>!</b><div><strong>{stats.overdue}</strong><span>Overdue</span></div></div>
        </div>

        {error && <div className="error">{error}<button onClick={() => setError("")}>×</button></div>}

        <section className="workspace">
          <div className="workspace-head"><div><h2>Your Tasks</h2><p>Manage and track your work from one dashboard.</p></div>{stats.completed > 0 && <button className="clear" onClick={() => setTasks(previous => previous.filter(task => !task.completed))}>Clear completed</button>}</div>

          <div className="toolbar">
            <div className="search"><span>⌕</span><input value={search} onChange={e => {setSearch(e.target.value);setPage(1)}} placeholder="Search tasks..."/>{search && <button onClick={() => setSearch("")}>×</button>}</div>
            <select value={sort} onChange={e => {setSort(e.target.value);setPage(1)}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Priority</option><option value="due">Due date</option></select>
          </div>

          <TaskFilter filter={filter} onFilterChange={value => {setFilter(value);setPage(1)}} counts={stats}/>

          {loading ? <div className="status">Loading your tasks...</div> :
            <TaskList tasks={visible} onToggle={toggleTask} onDelete={task => setModal({type:"delete",task})} onEdit={task => {setEditingTask(task);setModal({type:"form"})}} formatDateTime={dateTime}/>}
          
          {!loading && filtered.length > PAGE_SIZE && <div className="pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Previous</button><span>Page {currentPage} of {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next →</button></div>}
        </section>
      </section>

      {modal?.type === "form" && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && (setModal(null),setEditingTask(null))}><div className="modal"><div className="modal-head"><div><p className="eyebrow">{editingTask ? "UPDATE TASK" : "NEW TASK"}</p><h2>{editingTask ? "Edit task" : "Create a new task"}</h2></div><button className="close" onClick={() => {setModal(null);setEditingTask(null)}}>×</button></div><TaskForm task={editingTask} onSubmit={saveTask} onCancel={() => {setModal(null);setEditingTask(null)}}/></div></div>}

      {modal?.type === "delete" && <div className="modal-backdrop"><div className="modal confirm"><div className="warning">!</div><h2>Delete this task?</h2><p>This action cannot be undone. Are you sure you want to delete <strong>“{modal.task.title}”</strong>?</p><div className="modal-actions"><button className="secondary" onClick={() => setModal(null)}>Cancel</button><button className="danger" onClick={deleteTask}>Delete Task</button></div></div></div>}
    </main>
  );
}
export default App;