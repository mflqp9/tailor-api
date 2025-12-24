import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "user" | "admin" | "super_admin";
    branchId?: string;
    branches?: string[];
  };
}

export const UserAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      branchId: decoded.branchId,
      branches: decoded.branches,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// import { config } from "../config/env.js";
// import jwt from "jsonwebtoken";

// const UserAuth = (req: any, res: any, next: any) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ 
//       succeed: false,
//       message: "Authentication failed",
//       data: null,
//       error: "Authentication failed: No token provided",
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, config.JWT.secret);
//     req.user = decoded;
//     next(); 
//   } catch (err) {
//     return res.status(401).json({
//       succeed: false,
//       message: "Authentication failed",
//       data: null,
//       error: "Authentication failed token is missing or invalid",
//     });
//   }
// };

// export default UserAuth;