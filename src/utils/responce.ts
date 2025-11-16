// utils/response.ts
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponseOptions } from "../types/types.js";
// A utility function to standardize API responses
//param res - Express Response object
//param statusCode - HTTP status code
//param message - Response message
//param data - Response data (default is null)
//param error - Error information (default is null)

//returns JSON response with standardized structure
export function sendResponse(
  res: Response,
  {
    succeed = false,
    statusCode = StatusCodes.BAD_REQUEST,
    message = "",
    data = null,
    error = null,
  }: ResponseOptions
) {
  return res.status(statusCode).json({
    succeed,
    message,
    data,
    error,
  });
}
