import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomerModel from "../models/customers.js";
import { redis } from "../lib/redis.js";
import { AuthRequest } from "../middleware/userAuth.js";

export const getCustomersDetail = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role.toLowerCase();
    const userBranchId = req.user!.branchId;
    const branches = req.user!.branches;

    const search = (req.query.search as string) || "";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    let query: any = {};

    if (role === "user") {
      query.branchid = userBranchId;
    } else if (role === "admin") {
      if (!branches?.length) {
        return res.status(403).json({
          succeed: false,
          message: "No branches assigned to admin",
        });
      }
      query.branchid = { $in: branches };
    }
    // super_admin → no branch restriction

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const CACHE_VERSION = "v2";
    const cacheKey = `customers:${CACHE_VERSION}:${role}:${page}:${limit}:${JSON.stringify(query)}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const [data, total] = await Promise.all([
      CustomerModel.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),

      CustomerModel.countDocuments(query),
    ]);

    const response = {
      succeed: true,
      message: "Customers fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
      error: null,
    };

    await redis.setex(cacheKey, 30, JSON.stringify(response));
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      succeed: false,
      message: "Server error",
      error: err,
    });
  }
};

