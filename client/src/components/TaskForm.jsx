import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onAddTask(trimmedTitle);
    setTitle("");
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input value={title} onChange={event => setTitle(event.target.value)}
        placeholder="Enter a new task..." aria-label="Task title" />
      <button type="submit">Add Task</button>
    </form>
  );
}
export default TaskForm;