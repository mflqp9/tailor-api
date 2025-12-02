import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";
import { ILogin } from "../types/types.js";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.js";
import { config } from "../config/env.js";
import bcrypt from "bcryptjs";


//Post SignUp (verified)
  export const AddNewUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password,branchid }:ILogin = req.body;

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
    if (existsUser) {
      res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Operation failed.",
        data: null,
        error: "User already registered with this email. Please login.",
      });
      return;
    }

 // Case 1 — Profile exists AND verified
    if (existsProfile) {
      res.status(StatusCodes.CONFLICT).json({
        succeed: false,
        message: "Operation failed.",
        data: null,
        error: "Your already have a profile,you can't create new user.",
      });
      return;
    }
    // Hash password
    const salt = await bcrypt.genSalt(config.BCRYPTJS_ROUNDS);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new UserModel({
      branchId: branchid,
      email,
      password: hashPassword,
      role: "user",
      isActive: true,
    });

    await newUser.save();


    res.status(StatusCodes.CREATED).json({
      succeed: true,
      message: "Operation successfully.",
      data: {
        email: newUser.email,
        role: newUser.role,
      },
      error:null,
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