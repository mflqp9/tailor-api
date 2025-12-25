import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomerModel from "../models/customers.js";
import { redis } from "../lib/redis.js";
import { AuthRequest } from "../middleware/userAuth.js";

export const getCustomersDetail = async (req: AuthRequest, res: Response) => {
  try {
    const branchId = req.user?.branchId;

    if (!branchId) {
      return res.status(401).json({
        succeed: false,
        message: "Branch not found",
      });
    }

    const search = (req.query.search as string) || "";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    let query: any = {
      branchid: branchId,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      CustomerModel.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),

      CustomerModel.countDocuments(query),
    ]);
    res.json({
      succeed: true,
      data,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ succeed: false,error:error });
  }
};


