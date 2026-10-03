function date(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-PH",{dateStyle:"medium"}).format(new Date(value));
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const overdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
  return <li className={`task-item ${task.completed ? "completed" : ""}`}>
    <button className="check" onClick={() => onToggle(task._id)} aria-label="Toggle completion">{task.completed ? "✓" : ""}</button>
    <div className="task-main">
      <div className="title-row"><h3>{task.title}</h3><span className={`priority ${(task.priority||"Medium").toLowerCase()}`}>{task.priority || "Medium"}</span>{overdue && <span className="overdue">Overdue</span>}</div>
      {task.description && <p>{task.description}</p>}
      <div className="meta"><span>Created: {date(task.createdAt)}</span><span>Due: {date(task.dueDate)}</span><span>Done: {date(task.completedAt)}</span></div>
    </div>
    <div className="actions"><button className="edit" onClick={() => onEdit(task)}>Edit</button><button className="delete" onClick={() => onDelete(task)}>Delete</button></div>
  </li>;
}
export default TaskItem;