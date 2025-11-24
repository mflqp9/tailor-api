import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";



//Post Check Email if exists then send otp (verified)
  export const postForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Email",
        data: null,
        error: "Please enter email.",
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



    //Find profile
          const profile = await ProfileModel.findById(user.branchId);


   if (!profile.isActive || !profile.isVerified) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Operation Fail",
        data: null,
        error: "Requested profile is not active or verified.",
      });
      return;
    }



    // Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.JWT.secret,
      { expiresIn: "1d" }
    );

    const otp= generateOtp();

    res.status(StatusCodes.OK).json({
      succeed: true,
      message: "Operation Successful",
      data: {
        otp,
        token,
        id: user._id,
        email: user.email,
      },
      error:null
    });
  } catch (err) {
    console.error("CheckUer&OTP Error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "Operation Fail",
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};