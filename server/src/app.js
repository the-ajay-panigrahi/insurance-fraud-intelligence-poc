require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./database");

const authRoutes = require("./routes/authRoutes");
const claimRoutes = require("./routes/claimRoutes");
const investigationRoutes = require("./routes/investigationRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check endpoint (used by Playwright webServer)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "insurance-fraud-poc", uptime: process.uptime() });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api", claimRoutes);
app.use("/api/investigations", investigationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error occurred.",
  });
});

// Connect to MongoDB and listen
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Insurance Fraud Intelligence server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });

module.exports = app;
