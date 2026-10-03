const Task = require("../models/Task");

async function getTasks(req,res){
  try { res.json(await Task.find({ userId: req.user._id }).sort({createdAt:-1})); }
  catch { res.status(500).json({message:"Failed to fetch tasks."}); }
}

async function createTask(req,res){
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if(!title) return res.status(400).json({message:"Task title is required."});
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if(dueDate && Number.isNaN(dueDate.getTime())) return res.status(400).json({message:"Invalid due date."});
    const task = await Task.create({
      userId: req.user._id,
      title,
      description: typeof req.body.description === "string" ? req.body.description.trim() : "",
      priority: ["Low","Medium","High"].includes(req.body.priority) ? req.body.priority : "Medium",
      dueDate,
      completed:false,
      completedAt:null
    });
    res.status(201).json(task);
  } catch { res.status(500).json({message:"Failed to create task."}); }
}

async function updateTask(req,res){
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if(!task) return res.status(404).json({message:"Task not found."});

    if(typeof req.body.title === "string"){
      const title=req.body.title.trim();
      if(!title) return res.status(400).json({message:"Task title cannot be empty."});
      task.title=title;
    }
    if(typeof req.body.description === "string") task.description=req.body.description.trim();
    if(["Low","Medium","High"].includes(req.body.priority)) task.priority=req.body.priority;

    if(Object.prototype.hasOwnProperty.call(req.body,"dueDate")){
      if(!req.body.dueDate) task.dueDate=null;
      else {
        const dueDate=new Date(req.body.dueDate);
        if(Number.isNaN(dueDate.getTime())) return res.status(400).json({message:"Invalid due date."});
        task.dueDate=dueDate;
      }
    }

    if(typeof req.body.completed === "boolean"){
      if(req.body.completed && !task.completed) task.completedAt=new Date();
      if(!req.body.completed) task.completedAt=null;
      task.completed=req.body.completed;
    }

    await task.save();
    res.json(task);
  } catch(error) {
    if(error.name==="CastError") return res.status(400).json({message:"Invalid task ID."});
    res.status(500).json({message:"Failed to update task."});
  }
}

async function deleteTask(req,res){
  try {
    const task=await Task.findOneAndDelete({ _id:req.params.id, userId:req.user._id });
    if(!task) return res.status(404).json({message:"Task not found."});
    res.json({message:"Task deleted successfully."});
  } catch(error) {
    if(error.name==="CastError") return res.status(400).json({message:"Invalid task ID."});
    res.status(500).json({message:"Failed to delete task."});
  }
}

module.exports={getTasks,createTask,updateTask,deleteTask};