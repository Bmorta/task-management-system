const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type:String, required:true, trim:true, minlength:1, maxlength:200 },
  description: { type:String, trim:true, maxlength:1000, default:"" },
  priority: { type:String, enum:["Low","Medium","High"], default:"Medium" },
  dueDate: { type:Date, default:null },
  completed: { type:Boolean, default:false },
  completedAt: { type:Date, default:null }
},{timestamps:true});

module.exports = mongoose.model("Task",taskSchema);