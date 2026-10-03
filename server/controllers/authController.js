const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

async function signup(req, res) {
  try {
    const firstName = typeof req.body.firstName === "string" ? req.body.firstName.trim() : "";
    const lastName = typeof req.body.lastName === "string" ? req.body.lastName.trim() : "";
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "An account with this email already exists." });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: typeof req.body.phone === "string" ? req.body.phone.trim() : "",
      department: typeof req.body.department === "string" ? req.body.department.trim() : "",
      accountType: req.body.accountType === "Student" ? "Student" : "Office",
      role: "user",
      active: true
    });

    res.status(201).json({ token: signToken(user), user: user.toSafeObject() });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    res.status(500).json({ message: "Failed to create account." });
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!user.active) return res.status(403).json({ message: "Your account is inactive. Please contact an administrator." });

    res.json({ token: signToken(user), user: user.toSafeObject() });
  } catch {
    res.status(500).json({ message: "Unable to log in right now." });
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

module.exports = { signup, login, me };