const Task = require("../models/Task");

async function getTasks(req,res){
  try { res.json(await Task.find().sort({createdAt:-1})); }
  catch { res.status(500).json({message:"Failed to fetch tasks."}); }
}

async function createTask(req,res){
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if(!title) return res.status(400).json({message:"Task title is required."});
    const task = await Task.create({title, completed:false});
    res.status(201).json(task);
  } catch { res.status(500).json({message:"Failed to create task."}); }
}

async function updateTask(req,res){
  try {
    const updates = {};
    if(typeof req.body.title === "string"){
      const title=req.body.title.trim();
      if(!title) return res.status(400).json({message:"Task title cannot be empty."});
      updates.title=title;
    }
    if(typeof req.body.completed === "boolean") updates.completed=req.body.completed;
    const task=await Task.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true});
    if(!task) return res.status(404).json({message:"Task not found."});
    res.json(task);
  } catch(error) {
    if(error.name==="CastError") return res.status(400).json({message:"Invalid task ID."});
    res.status(500).json({message:"Failed to update task."});
  }
}

async function deleteTask(req,res){
  try {
    const task=await Task.findByIdAndDelete(req.params.id);
    if(!task) return res.status(404).json({message:"Task not found."});
    res.json({message:"Task deleted successfully."});
  } catch(error) {
    if(error.name==="CastError") return res.status(400).json({message:"Invalid task ID."});
    res.status(500).json({message:"Failed to delete task."});
  }
}

module.exports={getTasks,createTask,updateTask,deleteTask};