const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.DB_CONNECTION_URI) {
    throw new Error("DB_CONNECTION_URI is not defined in environment variables!");
  }
  await mongoose.connect(process.env.DB_CONNECTION_URI);
  console.log(`MongoDB connected successfully to database: ${mongoose.connection.name}`);
};

module.exports = connectDB;
