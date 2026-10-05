const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { getCookieOptions, userAuth } = require("../auth");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = user.generateJWT();
    res.cookie("token", token, getCookieOptions(req));

    return res.status(200).json({
      message: "Authentication successful",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during authentication." });
  }
});

router.post("/logout", (req, res) => {
  const options = getCookieOptions(req);
  options.expires = new Date(0);
  res.cookie("token", "", options);
  return res.status(200).json({ message: "Logged out successfully" });
});

router.get("/me", userAuth, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
