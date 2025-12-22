import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


//Post SignIn (verified)
  export const SignIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }:ILogin = req.body;

    // Validate input
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Invalid request.",
        data: null,
        error: "Email & password required",
      });
      return;
    }


    // Find user
     const user = await UserModel.findOne({ email });
     if (!user) {
       res.status(StatusCodes.BAD_REQUEST).json({
         succeed: false,
         message: "Login Failed",
         data: null,
         error: "User not found, please check email and try again.",
        });
        return;
      }
//Find profile
      const profile = await ProfileModel.findById(user.branchId);
   if (!profile.isActive) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Login Failed",
        data: null,
        error: "Requested profile is not active,please contact support to activation.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        succeed: false,
        message: "Login Failed",
        data: null,
        error: "Requestd user is inactive,please contact support to activation.",
      });
      return;
    }

    // Password check
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Login Failed",
        data: null,
        error: "Please check your credentials and try again to login.",
      });
      return;
    }

    // Expiry check
    if (new Date(user.expiry) < new Date()) {
      res.status(StatusCodes.FORBIDDEN).json({
        succeed: false,
        message: "Login Failed",
        data: null,
        error: "Account expired, contact support to activation",
      });
      return;
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.JWT.secret,
      { expiresIn: "1d" }
    );

    res.status(StatusCodes.OK).json({
      succeed: true,
      message: "Login successful",
      data: {
        token,
        id: user._id,
        email: user.email,
        role: user.role,
        name: profile.name,
        busname:profile.busname,
        phone: profile.phone,
        city: profile.city,
        lang: profile.lang,
        branchId: user.branchId,
      },
      error: null,
    });
  } catch (err) {
    console.error("SignIn Error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "Authentication failed.",
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};