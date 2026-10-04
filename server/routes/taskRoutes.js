const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  listInvitations,
  respondToInvitation
} = require("../controllers/taskController");

const router = express.Router();

router.use(requireAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

router.get("/invitations", listInvitations);
router.patch("/invitations/:id", respondToInvitation);

module.exports = router;
