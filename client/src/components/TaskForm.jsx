import { useEffect, useState } from "react";

function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState({title:"",description:"",priority:"Medium",dueDate:""});

  useEffect(() => {
    setForm(task ? {
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0,10) : ""
    } : {title:"",description:"",priority:"Medium",dueDate:""});
  }, [task]);

  const set = (key,value) => setForm(previous => ({...previous,[key]:value}));
  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({...form,title:form.title.trim(),...(task ? {_id:task._id} : {})});
  }

  return <form className="task-form" onSubmit={submit}>
    <label>Task title<input autoFocus required maxLength="200" value={form.title} onChange={e => set("title",e.target.value)} placeholder="e.g. Finish portfolio project"/></label>
    <label>Description <small>(optional)</small><textarea rows="4" maxLength="1000" value={form.description} onChange={e => set("description",e.target.value)} placeholder="Add notes or details..."/></label>
    <div className="form-row">
      <label>Priority<select value={form.priority} onChange={e => set("priority",e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label>
      <label>Due date <small>(optional)</small><input type="date" value={form.dueDate} onChange={e => set("dueDate",e.target.value)}/></label>
    </div>
    <div className="modal-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button className="primary" type="submit">{task ? "Save Changes" : "Create Task"}</button></div>
  </form>;
}
export default TaskForm;