const jwt = require("jsonwebtoken");
const User = require("./models/User");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required. No token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded._id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "User not found or session invalid." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message || "Invalid or expired token." });
  }
};

const getCookieOptions = (req) => {
  const isSecure =
    process.env.NODE_ENV === "production" ||
    req.secure ||
    req.headers["x-forwarded-proto"] === "https";

  return {
    expires: new Date(Date.now() + 24 * 3600000), // 24 hours
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
  };
};

module.exports = {
  userAuth,
  getCookieOptions,
};
