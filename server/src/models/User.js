const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "analyst",
      enum: ["analyst", "investigator", "admin"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" }
  );
};

userSchema.methods.checkPassword = async function (passwordInput) {
  return bcrypt.compare(passwordInput, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
