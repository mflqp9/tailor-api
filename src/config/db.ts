import mongoose from "mongoose";
import { ConnectionObject } from "../types/types.js";
import { config } from "../config/env.js";

const connection: ConnectionObject = {};

export async function dbConnect(): Promise<void> {
     // 1️⃣ Already connected
  if (connection.isConnected) {
    console.log("Database Already Connected");
    return;
  }

  try {

    const db = await mongoose.connect(config.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;    
    console.log("✅ MongoDB connected",connection.isConnected);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}