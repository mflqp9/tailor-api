import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt, { genSaltSync } from "bcryptjs";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";

let postSignUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: ILogin = req.body;

    // STEP 1 — Check if profile exists
    const existsProfile = await ProfileModel.findOne({ email });

    // STEP 2 — Check if user exists
    const existsUser = await UserModel.findOne({ email });

    // Case 1 — Profile exists AND already verified → user is fully registered
    if (existsProfile && existsProfile.isVerified) {
       res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Registration failed.",
        data: null,
        error: "Email already registered and verified. Please login.",
      });
      return;
    }

    // Case 2 — User exists but profile is missing → inconsistent state
    if (existsUser && !existsProfile) {
       res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Registration failed.",
        data: null,
        error:
          "Email already registered without profile. Please contact support.",
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
          role: existsUser?.role || "admin",
          branchId: existsUser?.branchId || existsProfile._id,
        },
        error: null,
      });
      return;
    }

    // Case 4 — Completely new user → create Profile + User
    const newProfile = new ProfileModel({ email });
    await newProfile.save();

    const salt =  genSaltSync(config.BCRYPTJS_ROUNDS);
    const hashPassword = await bcrypt.hash(password, salt);

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
      message: "User profile created successfully",
      data: {
        otp,
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        branchId: newUser.branchId,
      },
      error: null,
    });

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "An error occurred during registration.",
      data: null,
      error: (error as Error).message,
    });
  }
};


let postSignIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: ILogin = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(400).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "User not found.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(400).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "User not active",
      });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "Invalid credentials",
      });
      return;
    }

    // Check expiry
    if (new Date(user.expiry) < new Date()) {
      res.status(403).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "Account deactivated, contact support...",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, config.JWT.secret, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "Login Successfully",
      data: {
        token,
        id: user._id,
        branchId: user.branchId,
        email: user.email,
        role: user.role,
        expiry: user.expiry,
      },
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      succeed: false,
      message: "Authentication failed.",
      data: null,
      error: `catch error: ${err}`,
    });
  }
};

let postSignOut = (req: Request, res: Response): void => {
  // JWT logout handled client-side by deleting token
  res.json({
    succeed: true,
    message: "Logout successful. Delete token on client.",
    data: null,
    error: null,
  });
};

//Verified Controller
let postUserVerified = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: { email: string } = req.body;
    if (email) {
      const doc = await ProfileModel.findOneAndUpdate(
        { email },
        { isVerified: true },
        { new: true }
      );
      res.status(200).json({
        succeed: true,
        message: "User successfully verified.",
        data: {
          email: doc?.email,
          isVerified: doc?.isVerified,
        },
        error: null,
      });
      return;
    } else {
      res.status(400).json({
        message: "Authentication failed",
        data: null,
        error: "Email not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: "Authentication failed",
      data: null,
      error: `catch error: ${err}`,
    });
  }
};

let dashboard = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: "Welcome to the tailor API dashboard!",
  });
};

export { postSignUp, postSignIn, postSignOut, postUserVerified, dashboard };
