import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";


// SignOut (verified)
 export const SignOut = (req: Request, res: Response): void => {
  // JWT logout handled client-side by deleting token
  res.status(StatusCodes.ACCEPTED).json({
    succeed: true,
    message: "Logout successful. Delete token on client.",
    data: null,
    error: null,
  });
};