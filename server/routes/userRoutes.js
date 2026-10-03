const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { listUsers, createUser, updateUser, deleteUser, updateProfile } = require("../controllers/userController");

const router = express.Router();

router.use(requireAuth);
router.get("/profile", (req, res) => res.json({ user: req.user.toSafeObject() }));
router.patch("/profile", updateProfile);

router.get("/", requireAdmin, listUsers);
router.post("/", requireAdmin, createUser);
router.patch("/:id", requireAdmin, updateUser);
router.delete("/:id", requireAdmin, deleteUser);

module.exports = router;