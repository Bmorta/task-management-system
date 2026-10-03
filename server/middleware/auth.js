const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return process.env.JWT_SECRET;
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required." });

    const payload = jwt.verify(token, getSecret());
    const user = await User.findById(payload.userId);
    if (!user || !user.active) return res.status(401).json({ message: "Your account is inactive or no longer exists." });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Administrator access required." });
  next();
}

module.exports = { requireAuth, requireAdmin };