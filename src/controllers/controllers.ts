import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt from "bcryptjs";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";

let postSignUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: ILogin = req.body;

    const existsUser = await UserModel.findOne({ email });

    if (!existsUser) {
      //if user not exists

      //New User and Profile Creation
      const newProfile = new ProfileModel({
        email,
      });
      await newProfile.save();

      const profileId = newProfile._id.toString();

      const salt = config.BCRYPTJS_ROUNDS;
      const hashPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        branchId: profileId,
        email,
        password: hashPassword,
        role: "admin",
        isActive: true,
      });
      await newUser.save();
      const otp = generateOtp(); //generate otp for email verification

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
    } else {
      // if user exists and then check profile

      const existsProfile = await ProfileModel.findOne({ email });

      if (!existsProfile) {
        //if profile not exists, create profile
        res.status(StatusCodes.CONFLICT).json({
          succeed: false,
          message: "Registration failed.",
          data: null,
          error:
            "Email already registered without profile. Please contact support.",
        });
      } else {
        if (existsProfile.isVerified) {
          res.status(StatusCodes.CONFLICT).json({
            succeed: false,
            message: "Registration failed.",
            data: null,
            error: "Email already registered and verified. Please login.",
          });
        } else {
          const otp = generateOtp(); //generate otp for email verification
          res.status(StatusCodes.OK).json({
            succeed: true,
            message: "OTP sent for email verification.",
            data: {
              otp,
              id: existsProfile._id,
              email: existsProfile.email,
              role: existsUser.role,
              branchId: existsUser.branchId,
            },
            error: null,
          });
        }
      }
    }
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
        message: "Authentication failed.",
        data: null,
        error: "Invalid credentials",
      });
      return;
    }

    // Check expiry
    if (new Date(user.expiry) < new Date()) {
      res.status(403).json({
        message: "Authentication failed.",
        data: null,
        error: "Account deactivated, contact support...",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id },config.JWT.secret, {
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

    console.log("✅ Login Successfully");
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


export { postSignUp,postSignIn,postSignOut,postUserVerified, dashboard };
