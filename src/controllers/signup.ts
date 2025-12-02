import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt from "bcryptjs";
import { generateOtp } from "../utils/generateOtp.js";

//Post SignUp (verified)
 export const SignUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: ILogin = req.body;

    // Step 0 — Validate incoming body
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Invalid request.",
        data: null,
        error: "Email and password are required.",
      });
      return;
    }

    // Step 1 — Fetch profile + user in parallel (faster)
    const [existsProfile, existsUser] = await Promise.all([
      ProfileModel.findOne({ email }),
      UserModel.findOne({ email }),
    ]);

    // Case 1 — Profile exists AND verified
    if (existsProfile && existsProfile.isVerified) {
      res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Operation failed.",
        data: null,
        error: "Email already registered and verified. Please login.",
      });
      return;
    }

    // Case 2 — User exists but profile is missing (corrupted state)
    if (existsUser && !existsProfile) {
      res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Operation failed.",
        data: null,
        error: "Email already registered without profile. Contact support.",
      });
      return;
    }

    // Case 3 — Profile exists but not verified → resend OTP
    if (existsProfile && !existsProfile.isVerified) {
      const otp = generateOtp();

      res.status(StatusCodes.OK).json({
        succeed: true,
        message: "OTP sent for email verification.",
        data: {
          otp,
          id: existsProfile._id,
          email: existsProfile.email,
          role: existsUser?.role || "user",
          branchId: existsUser?.branchId || existsProfile._id,
        },
        error: null,
      });
      return;
    }

    // Case 4 — New user → Create Profile + User
    const newProfile = new ProfileModel({ email });
    await newProfile.save();

    // Hash password
    const salt = await bcrypt.genSalt(config.BCRYPTJS_ROUNDS);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new UserModel({
      branchId: newProfile._id.toString(),
      email,
      password: hashPassword,
      role: "admin",
      isActive: true,
    });

    await newUser.save();

    const otp = generateOtp();

    res.status(StatusCodes.CREATED).json({
      succeed: true,
      message: "User profile created successfully.",
      data: {
        otp,
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        branchId: newUser.branchId,
      },
      error: null,
    });
    return;

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "An error occurred during registration.",
      data: null,
      error: (error as Error).message,
    });
  }
};