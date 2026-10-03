import { useEffect, useMemo, useState } from "react";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilter from "./components/TaskFilter.jsx";
import TaskList from "./components/TaskList.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const PAGE_SIZE = 6;
const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

function dateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function shortDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value));
}
function initials(user) {
  return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
}

async function api(path, options = {}, token = localStorage.getItem(TOKEN_KEY)) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? "compact" : ""}`}>
    <div className="brand-logo"><img src="/taskflow-logo.svg" alt="TaskFlow" /></div>
    <div><strong>TaskFlow</strong><span>Work & Study Workspace</span></div>
  </div>;
}

function ThemeToggle({ theme, onToggle }) {
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"}>
    <span>{theme === "dark" ? "☀" : "☾"}</span><small>{theme === "dark" ? "Light" : "Dark"}</small>
  </button>;
}

function AuthShell({ mode, onModeChange, onAuthenticated, theme, onToggleTheme }) {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"", confirmPassword:"", phone:"", department:"", accountType:"Office" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signup = mode === "signup";
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (signup && form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const data = await api(signup ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(signup ? {
          firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password,
          phone: form.phone, department: form.department, accountType: form.accountType
        } : { email: form.email, password: form.password })
      }, null);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <main className={`auth-page ${theme === "dark" ? "theme-dark" : ""}`}>
    <div className="auth-orbit orbit-one"></div><div className="auth-orbit orbit-two"></div>
    <section className="auth-layout">
      <div className="auth-story">
        <Brand />
        <div className="story-copy">
          <p className="eyebrow">YOUR DAY. YOUR FLOW.</p>
          <h1>Turn busy days into <em>clear progress.</em></h1>
          <p>One focused workspace for office teams and students to plan, prioritize, and finish what matters.</p>
          <div className="feature-stack">
            <div><span>✓</span><div><strong>Plan with clarity</strong><small>Priorities, due dates, and simple status tracking.</small></div></div>
            <div><span>↗</span><div><strong>See your progress</strong><small>A dashboard designed around your everyday work.</small></div></div>
            <div><span>⌁</span><div><strong>Keep it personal</strong><small>Your account keeps your tasks in your own workspace.</small></div></div>
          </div>
        </div>
        <small className="auth-foot">Built for focused work & meaningful progress.</small>
      </div>

      <div className="auth-card-wrap"><ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="auth-card">
          <div className="mobile-brand"><Brand compact /></div>
          <div className="auth-heading">
            <span className="auth-badge">{signup ? "NEW ACCOUNT" : "WELCOME BACK"}</span>
            <h2>{signup ? "Create your workspace" : "Ready to get things done?"}</h2>
            <p>{signup ? "Set up your profile and start organizing your day." : "Sign in to continue to your personal dashboard."}</p>
          </div>

          {error && <div className="auth-error"><span>!</span>{error}</div>}

          <form className="auth-form" onSubmit={submit}>
            {signup && <div className="form-grid">
              <label>First name<input required value={form.firstName} onChange={e=>set("firstName",e.target.value)} placeholder="Brigitte"/></label>
              <label>Last name<input required value={form.lastName} onChange={e=>set("lastName",e.target.value)} placeholder="Morta"/></label>
            </div>}
            <label>Email address<input type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com"/></label>
            {signup && <div className="form-grid">
              <label>Phone <small>optional</small><input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+63 9XX XXX XXXX"/></label>
              <label>{form.accountType === "Student" ? "School / Program" : "Department"} <small>optional</small><input value={form.department} onChange={e=>set("department",e.target.value)} placeholder={form.accountType === "Student" ? "BSIT" : "Marketing"}/></label>
            </div>}
            {signup && <label>Account type<select value={form.accountType} onChange={e=>set("accountType",e.target.value)}><option>Office</option><option>Student</option></select></label>}
            <label>Password<input type={showPassword ? "text" : "password"} minLength="6" required value={form.password} onChange={e=>set("password",e.target.value)} placeholder="At least 6 characters"/></label>
            {signup && <label>Confirm password<input type={showPassword ? "text" : "password"} minLength="6" required value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} placeholder="Repeat your password"/></label>}
            <label className="check-label"><input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/><span>Show password</span></label>
            <button className="auth-submit" disabled={loading}>{loading ? "Please wait..." : signup ? "Create my account →" : "Sign in →"}</button>
          </form>

          <div className="auth-switch">
            <span>{signup ? "Already have an account?" : "New to TaskFlow?"}</span>
            <button onClick={() => { setError(""); onModeChange(signup ? "login" : "signup"); }}>{signup ? "Sign in" : "Create an account"}</button>
          </div>
        </div>
      </div>
    </section>
  </main>;
}

function Profile({ user, onUserChange, onLogout }) {
  const [form, setForm] = useState({ firstName:user.firstName, lastName:user.lastName, phone:user.phone || "", department:user.department || "", accountType:user.accountType || "Office", password:"" });
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  async function save(e){
    e.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const data=await api("/users/profile",{method:"PATCH",body:JSON.stringify(form)});
      localStorage.setItem(USER_KEY,JSON.stringify(data.user)); onUserChange(data.user); setForm(p=>({...p,password:""})); setMessage("Profile updated successfully.");
    } catch(err){setError(err.message)} finally{setSaving(false)}
  }

  return <section className="page-section profile-page">
    <div className="section-title"><div><p className="eyebrow">MY ACCOUNT</p><h2>Your profile</h2><p>Only you can view and update these personal details.</p></div></div>
    <div className="profile-layout">
      <div className="profile-card identity-card"><div className="profile-avatar large">{initials(user)}</div><h3>{user.firstName} {user.lastName}</h3><p>{user.email}</p><span className="role-pill">{user.role === "admin" ? "Administrator" : user.accountType}</span><div className="identity-lines"><div><span>Member since</span><strong>{shortDate(user.createdAt)}</strong></div><div><span>Department</span><strong>{user.department || "Not specified"}</strong></div></div><button className="logout-outline" onClick={onLogout}>Log out</button></div>
      <form className="profile-card profile-form" onSubmit={save}><h3>Personal information</h3><div className="form-grid"><label>First name<input value={form.firstName} onChange={e=>set("firstName",e.target.value)} required/></label><label>Last name<input value={form.lastName} onChange={e=>set("lastName",e.target.value)} required/></label></div><label>Email address<input value={user.email} disabled/></label><div className="form-grid"><label>Phone<input value={form.phone} onChange={e=>set("phone",e.target.value)}/></label><label>{form.accountType === "Student" ? "School / Program" : "Department"}<input value={form.department} onChange={e=>set("department",e.target.value)}/></label></div><label>Account type<select value={form.accountType} onChange={e=>set("accountType",e.target.value)}><option>Office</option><option>Student</option></select></label><div className="divider"></div><h3>Change password</h3><label>New password <small>leave blank to keep current password</small><input type="password" minLength="6" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="At least 6 characters"/></label>{error&&<div className="form-error">{error}</div>}{message&&<div className="form-success">{message}</div>}<button className="primary wide" disabled={saving}>{saving?"Saving...":"Save profile changes"}</button></form>
    </div>
  </section>;
}

function AdminUsers({ currentUser }) {
  const empty={firstName:"",lastName:"",email:"",password:"",phone:"",department:"",accountType:"Office",role:"user",active:true};
  const [users,setUsers]=useState([]); const [form,setForm]=useState(empty); const [editing,setEditing]=useState(null); const [show,setShow]=useState(false); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [message,setMessage]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  async function load(){try{setUsers(await api("/users"))}catch(err){setError(err.message)}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  function openCreate(){setEditing(null);setForm(empty);setShow(true);setError("");setMessage("")}
  function openEdit(user){setEditing(user);setForm({...empty,...user,password:""});setShow(true);setError("");setMessage("")}
  async function save(e){
    e.preventDefault();setError("");setMessage("");
    try{
      const payload={...form}; if(!payload.password)delete payload.password;
      const data=editing?await api(`/users/${editing._id}`,{method:"PATCH",body:JSON.stringify(payload)}):await api("/users",{method:"POST",body:JSON.stringify(payload)});
      setUsers(prev=>editing?prev.map(u=>u._id===data._id?data:u):[data,...prev]);setShow(false);setMessage(editing?"User updated successfully.":"User created successfully.");
    }catch(err){setError(err.message)}
  }
  async function remove(user){
    if(!confirm(`Delete ${user.firstName} ${user.lastName}'s account? This cannot be undone.`))return;
    try{await api(`/users/${user._id}`,{method:"DELETE"});setUsers(prev=>prev.filter(u=>u._id!==user._id));setMessage("User deleted successfully.")}catch(err){setError(err.message)}
  }
  async function toggle(user){
    try{const data=await api(`/users/${user._id}`,{method:"PATCH",body:JSON.stringify({active:!user.active})});setUsers(prev=>prev.map(u=>u._id===data._id?data:u))}catch(err){setError(err.message)}
  }

  return <section className="page-section">
    <div className="section-title"><div><p className="eyebrow">ADMINISTRATION</p><h2>User management</h2><p>Create, update, deactivate, and remove accounts from one place.</p></div><button className="primary" onClick={openCreate}>＋ Add user</button></div>
    {error&&<div className="error">{error}<button onClick={()=>setError("")}>×</button></div>}{message&&<div className="form-success banner">{message}</div>}
    <div className="admin-summary"><div><strong>{users.length}</strong><span>Total users</span></div><div><strong>{users.filter(u=>u.active).length}</strong><span>Active</span></div><div><strong>{users.filter(u=>u.role==="admin").length}</strong><span>Administrators</span></div></div>
    <div className="user-table-card">{loading?<div className="status">Loading users...</div>:<div className="user-table"><div className="user-row table-head"><span>User</span><span>Account</span><span>Status</span><span>Role</span><span>Actions</span></div>{users.map(user=><div className="user-row" key={user._id}><div className="user-cell"><div className="profile-avatar">{initials(user)}</div><div><strong>{user.firstName} {user.lastName}</strong><small>{user.email}</small></div></div><span>{user.accountType}<small>{user.department||"No department"}</small></span><button className={`status-toggle ${user.active?"on":"off"}`} disabled={user._id===currentUser._id} onClick={()=>toggle(user)}>{user.active?"Active":"Inactive"}</button><span className="role-text">{user.role}</span><div className="row-actions"><button onClick={()=>openEdit(user)}>Edit</button><button className="danger-text" disabled={user._id===currentUser._id} onClick={()=>remove(user)}>Delete</button></div></div>)}</div>}</div>
    {show&&<div className="modal-backdrop"><div className="modal admin-modal"><div className="modal-head"><div><p className="eyebrow">{editing?"UPDATE USER":"NEW USER"}</p><h2>{editing?"Edit user":"Add a user"}</h2></div><button className="close" onClick={()=>setShow(false)}>×</button></div><form className="task-form" onSubmit={save}><div className="form-grid"><label>First name<input required value={form.firstName} onChange={e=>set("firstName",e.target.value)}/></label><label>Last name<input required value={form.lastName} onChange={e=>set("lastName",e.target.value)}/></label></div><label>Email<input type="email" required value={form.email} onChange={e=>set("email",e.target.value)}/></label><label>Password <small>{editing?"leave blank to keep current":"required"}</small><input type="password" minLength="6" required={!editing} value={form.password} onChange={e=>set("password",e.target.value)} placeholder="At least 6 characters"/></label><div className="form-grid"><label>Account type<select value={form.accountType} onChange={e=>set("accountType",e.target.value)}><option>Office</option><option>Student</option></select></label><label>Role<select value={form.role} onChange={e=>set("role",e.target.value)}><option value="user">User</option><option value="admin">Admin</option></select></label></div><div className="form-grid"><label>Phone<input value={form.phone} onChange={e=>set("phone",e.target.value)}/></label><label>Department / Program<input value={form.department} onChange={e=>set("department",e.target.value)}/></label></div><label className="check-label"><input type="checkbox" checked={form.active} onChange={e=>set("active",e.target.checked)}/><span>Account is active</span></label>{error&&<div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShow(false)}>Cancel</button><button className="primary" type="submit">{editing?"Save changes":"Create user"}</button></div></form></div></div>}
  </section>;
}

function Dashboard({ user, onLogout, onProfile }) {
  const [tasks,setTasks]=useState([]),[filter,setFilter]=useState("All"),[search,setSearch]=useState(""),[sort,setSort]=useState("newest"),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState(""),[modal,setModal]=useState(null),[editingTask,setEditingTask]=useState(null),[now,setNow]=useState(new Date());

  useEffect(()=>{let alive=true;api("/tasks").then(data=>{if(alive)setTasks(data)}).catch(err=>{if(alive)setError(err.message)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[]);
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer)},[]);
  async function saveTask(form){try{setError("");const editing=Boolean(form._id);const data=await api(editing?`/tasks/${form._id}`:"/tasks",{method:editing?"PATCH":"POST",body:JSON.stringify({title:form.title,description:form.description,priority:form.priority,dueDate:form.dueDate||null})});setTasks(prev=>editing?prev.map(t=>t._id===data._id?data:t):[data,...prev]);setModal(null);setEditingTask(null);setPage(1)}catch(err){setError(err.message)}}
  async function toggleTask(id){try{const current=tasks.find(t=>t._id===id);if(!current)return;const data=await api(`/tasks/${id}`,{method:"PATCH",body:JSON.stringify({completed:!current.completed})});setTasks(prev=>prev.map(t=>t._id===id?data:t))}catch(err){setError(err.message)}}
  async function deleteTask(){if(!modal?.task)return;try{await api(`/tasks/${modal.task._id}`,{method:"DELETE"});setTasks(prev=>prev.filter(t=>t._id!==modal.task._id));setModal(null)}catch(err){setError(err.message)}}
  async function clearCompleted(){const completed=tasks.filter(t=>t.completed);if(!completed.length)return;try{await Promise.all(completed.map(t=>api(`/tasks/${t._id}`,{method:"DELETE"})));setTasks(prev=>prev.filter(t=>!t.completed))}catch(err){setError(err.message)}}
  const stats=useMemo(()=>{const completed=tasks.filter(t=>t.completed).length;const overdue=tasks.filter(t=>!t.completed&&t.dueDate&&new Date(t.dueDate)<new Date()).length;return{total:tasks.length,completed,active:tasks.length-completed,overdue}},[tasks]);
  const filtered=useMemo(()=>{const q=search.toLowerCase().trim();const result=tasks.filter(t=>{const status=filter==="Active"?!t.completed:filter==="Completed"?t.completed:filter==="Overdue"?(!t.completed&&t.dueDate&&new Date(t.dueDate)<new Date()):true;return status&&`${t.title} ${t.description||""}`.toLowerCase().includes(q)});return [...result].sort((a,b)=>{if(sort==="oldest")return new Date(a.createdAt)-new Date(b.createdAt);if(sort==="priority")return ({High:0,Medium:1,Low:2}[a.priority]??1)-({High:0,Medium:1,Low:2}[b.priority]??1);if(sort==="due")return(a.dueDate?new Date(a.dueDate):new Date("9999-12-31"))-(b.dueDate?new Date(b.dueDate):new Date("9999-12-31"));return new Date(b.createdAt)-new Date(a.createdAt)})},[tasks,filter,search,sort]);
  const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),currentPage=Math.min(page,pages),visible=filtered.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  return <><section className="dashboard"><header className="hero"><div><p className="eyebrow">MY WORKSPACE</p><h1>Stay organized.<br/><em>Get things done.</em></h1><p>Plan your work, track progress, and keep every task in one place.</p></div><div className="progress-card"><div className="progress-circle" style={{"--progress":stats.total?(stats.completed/stats.total)*100:0}}><strong>{stats.total?Math.round(stats.completed/stats.total*100):0}%</strong><span>complete</span></div><div><strong>{stats.completed} of {stats.total}</strong><span>tasks completed</span></div></div></header>
    <div className="stats-grid"><div className="stat"><b>▦</b><div><strong>{stats.total}</strong><span>Total Tasks</span></div></div><div className="stat"><b>◷</b><div><strong>{stats.active}</strong><span>Active</span></div></div><div className="stat"><b>✓</b><div><strong>{stats.completed}</strong><span>Completed</span></div></div><div className="stat"><b>!</b><div><strong>{stats.overdue}</strong><span>Overdue</span></div></div></div>
    {error&&<div className="error">{error}<button onClick={()=>setError("")}>×</button></div>}
    <section className="workspace"><div className="workspace-head"><div><h2>Your Tasks</h2><p>Manage and track your work from one dashboard.</p></div><div className="workspace-actions">{stats.completed>0&&<button className="clear" onClick={clearCompleted}>Clear completed</button>}<button className="primary add-task-button" onClick={()=>{setEditingTask(null);setModal({type:"form"})}}>＋ Add Task</button></div></div><div className="toolbar"><div className="search"><span>⌕</span><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search tasks..."/>{search&&<button onClick={()=>setSearch("")}>×</button>}</div><select value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="priority">Priority</option><option value="due">Due date</option></select></div><TaskFilter filter={filter} onFilterChange={value=>{setFilter(value);setPage(1)}} counts={stats}/>{loading?<div className="status">Loading your tasks...</div>:<TaskList tasks={visible} onToggle={toggleTask} onDelete={task=>setModal({type:"delete",task})} onEdit={task=>{setEditingTask(task);setModal({type:"form"})}} onAdd={()=>{setEditingTask(null);setModal({type:"form"})}}/>}{!loading&&filtered.length>PAGE_SIZE&&<div className="pagination"><button disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}>← Previous</button><span>Page {currentPage} of {pages}</span><button disabled={currentPage===pages} onClick={()=>setPage(currentPage+1)}>Next →</button></div>}</section></section>
    {modal?.type==="form"&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&(setModal(null),setEditingTask(null))}><div className="modal"><div className="modal-head"><div><p className="eyebrow">{editingTask?"UPDATE TASK":"NEW TASK"}</p><h2>{editingTask?"Edit task":"Create a new task"}</h2></div><button className="close" onClick={()=>{setModal(null);setEditingTask(null)}}>×</button></div><TaskForm task={editingTask} onSubmit={saveTask} onCancel={()=>{setModal(null);setEditingTask(null)}}/></div></div>}
    {modal?.type==="delete"&&<div className="modal-backdrop"><div className="modal confirm"><div className="warning">!</div><h2>Delete this task?</h2><p>This action cannot be undone. Are you sure you want to delete <strong>“{modal.task.title}”</strong>?</p><div className="modal-actions"><button className="secondary" onClick={()=>setModal(null)}>Cancel</button><button className="danger" onClick={deleteTask}>Delete Task</button></div></div></div>}</>;
}

function App() {
  const [auth,setAuth]=useState(null),[authMode,setAuthMode]=useState("login"),[view,setView]=useState("dashboard"),[checking,setChecking]=useState(true);
  const [theme,setTheme]=useState(()=>localStorage.getItem("taskflow_theme")||"light");
  function toggleTheme(){setTheme(previous=>{const next=previous==="dark"?"light":"dark";localStorage.setItem("taskflow_theme",next);return next})}
  useEffect(()=>{const token=localStorage.getItem(TOKEN_KEY);if(!token){setChecking(false);return}api("/auth/me",{},token).then(data=>setAuth(data.user)).catch(()=>{localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY)}).finally(()=>setChecking(false))},[]);
  function logout(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);setAuth(null);setView("dashboard");setAuthMode("login")}
  if(checking)return <div className={`loading-screen ${theme === "dark" ? "theme-dark" : ""}`}><div className="loading-logo"><img src="/taskflow-logo.svg" alt="TaskFlow"/></div><strong>Loading TaskFlow</strong><span>Preparing your workspace...</span></div>;
  if(!auth)return <AuthShell mode={authMode} onModeChange={setAuthMode} onAuthenticated={setAuth} theme={theme} onToggleTheme={toggleTheme}/>;

  return <main className={`app-shell ${theme === "dark" ? "theme-dark" : ""}`}>
    <nav className="navbar"><Brand/><div className="nav-center"><button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>Dashboard</button><button className={view==="profile"?"active":""} onClick={()=>setView("profile")}>My Profile</button>{auth.role==="admin"&&<button className={view==="users"?"active":""} onClick={()=>setView("users")}>Users</button>}</div><div className="nav-tools"><ThemeToggle theme={theme} onToggle={toggleTheme}/><div className="nav-user"><div><strong>Hello, {auth.firstName}!</strong><span>{dateTime(new Date())}</span></div><button className="avatar-button" onClick={()=>setView("profile")}><span className="profile-avatar">{initials(auth)}</span></button><button className="logout-btn" onClick={logout}>Log out</button></div></nav>
    {view==="dashboard"&&<Dashboard user={auth} onLogout={logout}/>}
    {view==="profile"&&<Profile user={auth} onUserChange={setAuth} onLogout={logout}/>}
    {view==="users"&&auth.role==="admin"&&<AdminUsers currentUser={auth}/>}
    <footer className="site-footer"><span>TaskFlow</span><span>Focused work. Clear progress.</span></footer>
  </main>;
}

export default App;