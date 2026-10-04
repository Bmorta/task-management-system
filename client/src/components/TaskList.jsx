import TaskItem from "./TaskItem.jsx";

function TaskList({ tasks, onToggle, onDelete, onEdit, onAdd, canManage }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✓</div>
        <h2>No tasks found</h2>
        <p>Add a task to start organizing your work.</p>
        <button className="primary empty-add" onClick={onAdd}>＋ Add your first task</button>
      </div>
    );
  }
  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          canManage={canManage(task)}
        />
      ))}
    </ul>
  );
}
export default TaskList;