const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  department: { type: String, trim: true, maxlength: 100, default: "" },
  accountType: { type: String, enum: ["Office", "Student"], default: "Office" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    department: this.department,
    accountType: this.accountType,
    role: this.role,
    active: this.active,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model("User", userSchema);