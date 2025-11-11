import mongoose from "mongoose";
import config from "../config/environment"
let isConnected = false; // Track connection state

export const dbConnected = async (): Promise<void> => {
  if (isConnected) {
    console.log("⚡ MongoDB already connected.");
    return;
  }

  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    isConnected = !!conn.connections[0].readyState; // 1 = connected
    console.log("✅ MongoDB connected successfully.");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // stop the app if connection fails
  }
};

// export const disconnectDB = async (): Promise<void> => {
//   if (!isConnected) {
//     console.log("⚠️ MongoDB is not connected.");
//     return;
//   }

//   await mongoose.disconnect();
//   isConnected = false;
//   console.log("🔌 MongoDB disconnected.");
// };
