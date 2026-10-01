function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-content">
        <button type="button" className="check-button" onClick={() => onToggle(task._id)}>
          {task.completed ? "✓" : ""}
        </button>
        <span>{task.title}</span>
      </div>
      <button type="button" className="delete-button" onClick={() => onDelete(task._id)}>Delete</button>
    </li>
  );
}
export default TaskItem;