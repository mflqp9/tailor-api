import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt, { genSaltSync } from "bcryptjs";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";
//Post SignUp (verified)
 const postSignUp = async (req: Request, res: Response): Promise<void> => {
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
        message: "Registration failed.",
        data: null,
        error: "Email already registered and verified. Please login.",
      });
      return;
    }

    // Case 2 — User exists but profile is missing (corrupted state)
    if (existsUser && !existsProfile) {
      res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Registration failed.",
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

//Post SignIn (verified)
 const postSignIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

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
        message: "Authentication failed.",
        data: null,
        error: "User not found",
      });
      return;
    }

    if (!user.isActive) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "User is inactive",
      });
      return;
    }

    // Password check
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "Invalid credentials",
      });
      return;
    }

    // Expiry check
    if (new Date(user.expiry) < new Date()) {
      res.status(StatusCodes.FORBIDDEN).json({
        succeed: false,
        message: "Authentication failed.",
        data: null,
        error: "Account expired, contact support",
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
        branchId: user.branchId,
        expiry: user.expiry,
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

// SignOut (verified)
let postSignOut = (req: Request, res: Response): void => {
  // JWT logout handled client-side by deleting token
  res.status(StatusCodes.ACCEPTED).json({
    succeed: true,
    message: "Logout successful. Delete token on client.",
    data: null,
    error: null,
  });
};

//Verified Controller (verified)
let postUserVerified = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        succeed: false,
        message: "Authentication failed",
        data: null,
        error: "A valid email is required",
      });
    }

    // Check if user profile exists
    const profile = await ProfileModel.findOne({ email });

    if (!profile) {
      return res.status(404).json({
        succeed: false,
        message: "Authentication failed",
        data: null,
        error: "User profile not found",
      });
    }

    // Verify user now
    profile.isVerified = true;
    await profile.save();

    return res.status(200).json({
      succeed: true,
      message: "User successfully verified.",
      data: {
        email: profile.email,
        isVerified: true,
      },
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({
      succeed: false,
      message: "Authentication failed",
      data: null,
      error: error.message || "Internal server error",
    });
  }
};

export { postSignUp, postSignIn, postSignOut, postUserVerified };
