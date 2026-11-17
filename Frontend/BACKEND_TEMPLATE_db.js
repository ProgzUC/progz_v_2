/**
 * BACKEND — config/db.js (reference)
 * Error fix: MONGO_URI must be set in .env before mongoose.connect()
 */

import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "MongoDB Error: MONGO_URI is missing. Create ~/progz_backend/.env with MONGO_URI=..."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
