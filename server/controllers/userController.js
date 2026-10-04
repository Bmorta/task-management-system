const User = require("../models/User");

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsername(value) {
  return clean(value).replace(/^@/, "").toLowerCase();
}

function fallbackUsername(email) {
  return String(email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
}

async function listUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(user => user.toSafeObject()));
  } catch {
    res.status(500).json({ message: "Failed to load users." });
  }
}

async function createUser(req, res) {
  try {
    const firstName = clean(req.body.firstName);
    const lastName = clean(req.body.lastName);
    const email = clean(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const username = normalizeUsername(req.body.username) || fallbackUsername(email);

    if (!firstName || !lastName || !email || password.length < 6) {
      return res.status(400).json({
        message: "First name, last name, email and a password of at least 6 characters are required."
      });
    }

    if (!username || username.length < 3) {
      return res.status(400).json({
        message: "A valid username is required."
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    if (await User.findOne({ username })) {
      return res.status(409).json({ message: "Username is already in use." });
    }

    const user = await User.create({
      username,
      firstName,
      lastName,
      email,
      password,
      phone: clean(req.body.phone),
      department: clean(req.body.department),
      accountType: req.body.accountType === "Student" ? "Student" : "Office",
      role: req.body.role === "admin" ? "admin" : "user",
      active: req.body.active !== false
    });

    res.status(201).json(user.toSafeObject());
  } catch {
    res.status(500).json({ message: "Failed to create user." });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (typeof req.body.username === "string") {
      const username = normalizeUsername(req.body.username);

      if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters." });
      }

      const existing = await User.findOne({
        username,
        _id: { $ne: user._id }
      });

      if (existing) {
        return res.status(409).json({ message: "Username is already in use." });
      }

      user.username = username;
    }

    if (typeof req.body.firstName === "string") user.firstName = clean(req.body.firstName);
    if (typeof req.body.lastName === "string") user.lastName = clean(req.body.lastName);
    if (typeof req.body.email === "string") user.email = clean(req.body.email).toLowerCase();
    if (typeof req.body.phone === "string") user.phone = clean(req.body.phone);
    if (typeof req.body.department === "string") user.department = clean(req.body.department);
    if (req.body.accountType === "Office" || req.body.accountType === "Student") user.accountType = req.body.accountType;
    if (req.body.role === "user" || req.body.role === "admin") user.role = req.body.role;

    if (
      typeof req.body.active === "boolean" &&
      user._id.toString() !== req.user._id.toString()
    ) {
      user.active = req.body.active;
    }

    if (typeof req.body.password === "string" && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    if (!user.firstName || !user.lastName || !user.email) {
      return res.status(400).json({ message: "Name and email cannot be empty." });
    }

    await user.save();
    res.json(user.toSafeObject());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or username is already in use."
      });
    }

    res.status(500).json({ message: "Failed to update user." });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own administrator account."
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch {
    res.status(500).json({ message: "Failed to delete user." });
  }
}

async function updateProfile(req, res) {
  try {
    const user = req.user;

    if (typeof req.body.username === "string") {
      const username = normalizeUsername(req.body.username);

      if (!username || username.length < 3) {
        return res.status(400).json({
          message: "Username must be at least 3 characters."
        });
      }

      const existing = await User.findOne({
        username,
        _id: { $ne: user._id }
      });

      if (existing) {
        return res.status(409).json({
          message: "Username is already in use."
        });
      }

      user.username = username;
    }

    if (typeof req.body.firstName === "string") user.firstName = clean(req.body.firstName);
    if (typeof req.body.lastName === "string") user.lastName = clean(req.body.lastName);
    if (typeof req.body.phone === "string") user.phone = clean(req.body.phone);
    if (typeof req.body.department === "string") user.department = clean(req.body.department);
    if (req.body.accountType === "Office" || req.body.accountType === "Student") user.accountType = req.body.accountType;

    if (typeof req.body.password === "string" && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username is already in use." });
    }

    res.status(500).json({ message: "Failed to update your profile." });
  }
}

async function searchUsers(req, res) {
  try {
    const query = normalizeUsername(req.query.username);

    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      active: true
    })
      .sort({ firstName: 1 })
      .limit(20);

    const matches = users
      .filter(user => {
        const username = user.username || fallbackUsername(user.email);
        return username.includes(query);
      })
      .map(user => ({
        _id: user._id,
        username: user.username || fallbackUsername(user.email),
        firstName: user.firstName,
        lastName: user.lastName,
        accountType: user.accountType
      }));

    res.json(matches);
  } catch {
    res.status(500).json({ message: "Failed to search users." });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  searchUsers
};
