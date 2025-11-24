import type { Request, Response } from "express";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt from "bcryptjs";

  export const postSetNewPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email,password }:ILogin = req.body;

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

    // Find User
     const user = await UserModel.findOne({ email });

     if (!user) {
       res.status(StatusCodes.BAD_REQUEST).json({
         succeed: false,
         message: "Operation Fail",
         data: null,
         error: "User not found, please try again with correct email",
        });
        return;
      }

    if (!user.isActive) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        succeed: false,
        message: "Operation Fail",
        data: null,
        error: "Requestd user is inactive,please contact support to activation.",
      });
      return;
    }

       // Hash password
    const salt = await bcrypt.genSalt(config.BCRYPTJS_ROUNDS);
    const hashPassword = await bcrypt.hash(password, salt);

    user.password=hashPassword;
    await user.save();
    res.status(StatusCodes.OK).json({
      succeed: true,
      message: "Operation Successful",
      data: {
        id: user._id,
        email: user.email,
      },
      error:null
    });
  } catch (err) {
    console.error("SetNewPassword Error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "Operation Fail",
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};