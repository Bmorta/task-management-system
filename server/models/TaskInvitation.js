const mongoose = require("mongoose");

const taskInvitationSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["assignment", "collaboration"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model("TaskInvitation", taskInvitationSchema);
