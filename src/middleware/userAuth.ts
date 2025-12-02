import { config } from "../config/env.js";
import jwt from "jsonwebtoken";

const UserAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      succeed: false,
      message: "Authentication failed",
      data: null,
      error: "Authentication failed: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT.secret);
    req.user = decoded;
    next(); 
  } catch (err) {
    return res.status(401).json({
      succeed: false,
      message: "Authentication failed",
      data: null,
      error: "Authentication failed token is missing or invalid",
    });
  }
};

export default UserAuth;