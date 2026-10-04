const Task = require("../models/Task");
const User = require("../models/User");
const TaskInvitation = require("../models/TaskInvitation");

function normalizeUsername(value) {
  return typeof value === "string"
    ? value.trim().replace(/^@/, "").toLowerCase()
    : "";
}

function fallbackUsername(email) {
  return String(email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
}

function userSummary(user) {
  if (!user) return null;
  return {
    _id: user._id,
    username: user.username || fallbackUsername(user.email),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    accountType: user.accountType
  };
}

async function findUserByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  const direct = await User.findOne({
    username: normalized,
    active: true
  });

  if (direct) return direct;

  const users = await User.find({ active: true });
  return users.find(user => fallbackUsername(user.email) === normalized) || null;
}

async function prepareTask(task) {
  await task.populate([
    { path: "assignee", select: "username firstName lastName email accountType" },
    { path: "collaborators.userId", select: "username firstName lastName email accountType" }
  ]);

  const data = task.toObject();

  return {
    ...data,
    assignee: userSummary(data.assignee),
    collaborators: (data.collaborators || []).map(item => ({
      user: userSummary(item.userId),
      status: item.status,
      addedAt: item.addedAt
    }))
  };
}

async function createInvitations(task, senderId, assignUsername, collaboratorUsernames = []) {
  const uniqueCollaborators = [...new Set(
    collaboratorUsernames
      .map(normalizeUsername)
      .filter(Boolean)
  )];

  if (assignUsername) {
    const assignee = await findUserByUsername(assignUsername);

    if (!assignee) {
      throw Object.assign(new Error("The assigned username was not found."), {
        statusCode: 404
      });
    }

    if (assignee._id.toString() === senderId.toString()) {
      throw Object.assign(new Error("You are already the owner of this task."), {
        statusCode: 400
      });
    }

    task.assignee = assignee._id;
    task.assignmentStatus = "pending";

    await TaskInvitation.create({
      taskId: task._id,
      senderId,
      recipientId: assignee._id,
      type: "assignment"
    });
  }

  for (const username of uniqueCollaborators) {
    const collaborator = await findUserByUsername(username);

    if (!collaborator) {
      throw Object.assign(new Error(`Collaborator username "${username}" was not found.`), {
        statusCode: 404
      });
    }

    if (collaborator._id.toString() === senderId.toString()) continue;

    if (
      task.assignee &&
      collaborator._id.toString() === task.assignee.toString()
    ) {
      continue;
    }

    const existing = task.collaborators.find(
      item => item.userId.toString() === collaborator._id.toString()
    );

    if (!existing) {
      task.collaborators.push({
        userId: collaborator._id,
        status: "pending"
      });

      await TaskInvitation.create({
        taskId: task._id,
        senderId,
        recipientId: collaborator._id,
        type: "collaboration"
      });
    }
  }
}

async function getTasks(req, res) {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [
        { userId },
        { assignee: userId, assignmentStatus: "accepted" },
        { "collaborators": { $elemMatch: { userId, status: "accepted" } } }
      ]
    }).sort({ createdAt: -1 });

    res.json(await Promise.all(tasks.map(prepareTask)));
  } catch {
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
}

async function createTask(req, res) {
  try {
    const title = typeof req.body.title === "string"
      ? req.body.title.trim()
      : "";

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const dueDate = req.body.dueDate
      ? new Date(req.body.dueDate)
      : null;

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ message: "Invalid due date." });
    }

    const task = await Task.create({
      userId: req.user._id,
      title,
      description: typeof req.body.description === "string"
        ? req.body.description.trim()
        : "",
      priority: ["Low", "Medium", "High"].includes(req.body.priority)
        ? req.body.priority
        : "Medium",
      dueDate,
      completed: false,
      completedAt: null
    });

    try {
      await createInvitations(
        task,
        req.user._id,
        req.body.assignUsername,
        Array.isArray(req.body.collaboratorUsernames)
          ? req.body.collaboratorUsernames
          : []
      );

      await task.save();
    } catch (error) {
      await TaskInvitation.deleteMany({ taskId: task._id });
      await Task.findByIdAndDelete(task._id);

      return res.status(error.statusCode || 500).json({
        message: error.message || "Failed to create task invitations."
      });
    }

    res.status(201).json(await prepareTask(task));
  } catch {
    res.status(500).json({ message: "Failed to create task." });
  }
}

async function updateTask(req, res) {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { assignee: req.user._id, assignmentStatus: "accepted" },
        {
          collaborators: {
            $elemMatch: {
              userId: req.user._id,
              status: "accepted"
            }
          }
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const isOwner = task.userId.toString() === req.user._id.toString();

    if (!isOwner) {
      if (typeof req.body.completed !== "boolean") {
        return res.status(403).json({
          message: "Only the task owner can edit task details."
        });
      }

      if (req.body.completed && !task.completed) {
        task.completedAt = new Date();
      }

      if (!req.body.completed) {
        task.completedAt = null;
      }

      task.completed = req.body.completed;
      await task.save();

      return res.json(await prepareTask(task));
    }

    if (typeof req.body.title === "string") {
      const title = req.body.title.trim();

      if (!title) {
        return res.status(400).json({
          message: "Task title cannot be empty."
        });
      }

      task.title = title;
    }

    if (typeof req.body.description === "string") {
      task.description = req.body.description.trim();
    }

    if (["Low", "Medium", "High"].includes(req.body.priority)) {
      task.priority = req.body.priority;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "dueDate")) {
      if (!req.body.dueDate) {
        task.dueDate = null;
      } else {
        const dueDate = new Date(req.body.dueDate);

        if (Number.isNaN(dueDate.getTime())) {
          return res.status(400).json({
            message: "Invalid due date."
          });
        }

        task.dueDate = dueDate;
      }
    }

    if (typeof req.body.completed === "boolean") {
      if (req.body.completed && !task.completed) {
        task.completedAt = new Date();
      }

      if (!req.body.completed) {
        task.completedAt = null;
      }

      task.completed = req.body.completed;
    }

    if (typeof req.body.assignUsername === "string") {
      const username = normalizeUsername(req.body.assignUsername);

      if (!username) {
        task.assignee = null;
        task.assignmentStatus = "none";

        await TaskInvitation.deleteMany({
          taskId: task._id,
          type: "assignment",
          status: "pending"
        });
      } else {
        const assignee = await findUserByUsername(username);

        if (!assignee) {
          return res.status(404).json({
            message: "The assigned username was not found."
          });
        }

        if (assignee._id.toString() === req.user._id.toString()) {
          return res.status(400).json({
            message: "You are already the owner of this task."
          });
        }

        const changedAssignee =
          !task.assignee ||
          task.assignee.toString() !== assignee._id.toString();

        if (changedAssignee) {
          task.assignee = assignee._id;
          task.assignmentStatus = "pending";

          await TaskInvitation.deleteMany({
            taskId: task._id,
            type: "assignment",
            status: "pending"
          });

          await TaskInvitation.create({
            taskId: task._id,
            senderId: req.user._id,
            recipientId: assignee._id,
            type: "assignment"
          });
        }
      }
    }

    if (Array.isArray(req.body.collaboratorUsernames)) {
      for (const rawUsername of req.body.collaboratorUsernames) {
        const username = normalizeUsername(rawUsername);

        if (!username) continue;

        const collaborator = await findUserByUsername(username);

        if (!collaborator) {
          return res.status(404).json({
            message: `Collaborator username "${username}" was not found.`
          });
        }

        if (collaborator._id.toString() === req.user._id.toString()) {
          continue;
        }

        if (
          task.assignee &&
          collaborator._id.toString() === task.assignee.toString()
        ) {
          continue;
        }

        const exists = task.collaborators.some(
          item => item.userId.toString() === collaborator._id.toString()
        );

        if (!exists) {
          task.collaborators.push({
            userId: collaborator._id,
            status: "pending"
          });

          await TaskInvitation.create({
            taskId: task._id,
            senderId: req.user._id,
            recipientId: collaborator._id,
            type: "collaboration"
          });
        }
      }
    }

    await task.save();
    res.json(await prepareTask(task));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    res.status(500).json({
      message: error.message || "Failed to update task."
    });
  }
}

async function deleteTask(req, res) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await TaskInvitation.deleteMany({ taskId: task._id });

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    res.status(500).json({ message: "Failed to delete task." });
  }
}

async function listInvitations(req, res) {
  try {
    const invitations = await TaskInvitation.find({
      recipientId: req.user._id,
      status: "pending"
    })
      .populate("taskId", "title dueDate priority userId")
      .populate("senderId", "username firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch {
    res.status(500).json({ message: "Failed to load task invitations." });
  }
}

async function respondToInvitation(req, res) {
  try {
    const invitation = await TaskInvitation.findOne({
      _id: req.params.id,
      recipientId: req.user._id,
      status: "pending"
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found or already handled."
      });
    }

    const task = await Task.findById(invitation.taskId);

    if (!task) {
      invitation.status = "declined";
      await invitation.save();

      return res.status(404).json({
        message: "The task no longer exists."
      });
    }

    const accepted = req.body.action === "accept";

    invitation.status = accepted ? "accepted" : "declined";
    await invitation.save();

    if (invitation.type === "assignment") {
      const isCurrentAssignment =
        task.assignee &&
        task.assignee.toString() === req.user._id.toString();

      if (accepted && isCurrentAssignment) {
        task.assignmentStatus = "accepted";
      } else if (!accepted && isCurrentAssignment) {
        task.assignmentStatus = "declined";
        task.assignee = null;
      }
    }

    if (invitation.type === "collaboration") {
      const collaborator = task.collaborators.find(
        item => item.userId.toString() === req.user._id.toString()
      );

      if (collaborator) {
        collaborator.status = accepted ? "accepted" : "declined";
      }
    }

    await task.save();

    res.json({
      message: accepted
        ? "Invitation accepted."
        : "Invitation declined."
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid invitation." });
    }

    res.status(500).json({
      message: "Failed to respond to the invitation."
    });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  listInvitations,
  respondToInvitation
};
