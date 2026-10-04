import { useEffect, useState } from "react";

function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignUsername: "",
    collaboratorUsernames: ""
  });

  useEffect(() => {
    const collaborators = task?.collaborators
      ?.map(item => item.user?.username)
      .filter(Boolean)
      .join(", ");

    setForm(task ? {
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
      assignUsername: task.assignee?.username || "",
      collaboratorUsernames: collaborators || ""
    } : {
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      assignUsername: "",
      collaboratorUsernames: ""
    });
  }, [task]);

  const set = (key, value) => {
    setForm(previous => ({
      ...previous,
      [key]: value
    }));
  };

  function submit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    const collaboratorUsernames = form.collaboratorUsernames
      .split(",")
      .map(username => username.trim())
      .filter(Boolean);

    onSubmit({
      ...form,
      title: form.title.trim(),
      assignUsername: form.assignUsername.trim(),
      collaboratorUsernames,
      ...(task ? { _id: task._id } : {})
    });
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <label>
        Task title
        <input
          autoFocus
          required
          maxLength="200"
          value={form.title}
          onChange={event => set("title", event.target.value)}
          placeholder="e.g. Finish portfolio project"
        />
      </label>

      <label>
        Description <small>(optional)</small>
        <textarea
          rows="4"
          maxLength="1000"
          value={form.description}
          onChange={event => set("description", event.target.value)}
          placeholder="Add notes or details..."
        />
      </label>

      <div className="form-row">
        <label>
          Priority
          <select
            value={form.priority}
            onChange={event => set("priority", event.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>

        <label>
          Due date <small>(optional)</small>
          <input
            type="date"
            value={form.dueDate}
            onChange={event => set("dueDate", event.target.value)}
          />
        </label>
      </div>

      <div className="collaboration-fields">
        <label>
          Assign to <small>(username, optional)</small>
          <input
            value={form.assignUsername}
            onChange={event => set("assignUsername", event.target.value)}
            placeholder="@username"
          />
        </label>

        <label>
          Collaborators <small>(usernames, comma separated)</small>
          <input
            value={form.collaboratorUsernames}
            onChange={event => set("collaboratorUsernames", event.target.value)}
            placeholder="@username1, @username2"
          />
        </label>

        <p className="collaboration-help">
          Assignment and collaboration require the other user to accept the invitation first.
        </p>
      </div>

      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" type="submit">
          {task ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
