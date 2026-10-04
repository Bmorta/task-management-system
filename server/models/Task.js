const mongoose = require("mongoose");

const collaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending"
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: Date, default: null },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignmentStatus: {
    type: String,
    enum: ["none", "pending", "accepted", "declined"],
    default: "none"
  },
  collaborators: {
    type: [collaboratorSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
