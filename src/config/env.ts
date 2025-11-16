import dotenv from "dotenv";

// Function call for env accessible
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT || 5000),
  HOST: String(process.env.HOST || "0.0.0.0"),
  RESEND_API_KEY: process.env.RESEND_API_KEY || "API_KEY",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/tailor-api",
  BCRYPTJS_ROUNDS: Number.parseInt(process.env.BCRYPT_ROUNDS || "10", 10),
  JWT: {
    secret: process.env.JWT_SECRET || "2ndAlt",
    expire: process.env.JWT_EXPIRE || "2d",
  },
  NODE_ENV:process.env.NODE_ENV || "production",
};
