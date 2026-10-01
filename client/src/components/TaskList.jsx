import TaskItem from "./TaskItem.jsx";

function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <div className="empty-state"><h2>No tasks found</h2><p>Add a task or change the current filter.</p></div>;
  }
  return (
    <ul className="task-list">
      {tasks.map(task => <TaskItem key={task._id} task={task} onToggle={onToggle} onDelete={onDelete} />)}
    </ul>
  );
}
export default TaskList;