import type { Request, Response } from "express";
import ProfileModel from "../models/profile.js";

//Verified Controller (verified)

export const postUserVerified = async (req: Request, res: Response) => {
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