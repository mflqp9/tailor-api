import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomerModel from "../models/customers.js";

export const getCustomersDetail = async (req:Request, res:Response) => {
  try {
    const { search = "" } = req.query;

    // 🔹 If search exists → filter
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const customers = await CustomerModel.find(
      query,
      {
        _id: 1,
        name: 1,
        mobile: 1,
        comment: 1,
        date: 1
      }
    ).sort({ date: -1 });

    res.status(StatusCodes.OK).json({
      succeed: true,
        message: "Customers fetched successfully.",
        data:{
            count: customers.length,
            customers
        },
        error: null
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "Failed to fetch customers",
      data: null,
      error: (error as Error).message
    });
  }}