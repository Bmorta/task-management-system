require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "TaskMate API is running" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", database: "MongoDB" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set. No default admin was created.");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log("Existing admin account role restored.");
    }
    return;
  }

  const admin = await User.create({
    firstName: process.env.ADMIN_FIRST_NAME || "System",
    lastName: process.env.ADMIN_LAST_NAME || "Administrator",
    email,
    password,
    phone: "",
    department: "Administration",
    accountType: "Office",
    role: "admin",
    active: true
  });
  console.log(`Default admin created: ${admin.email}`);
}

async function startServer() {
  try {
    await connectDB();
    await ensureAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}
startServer();