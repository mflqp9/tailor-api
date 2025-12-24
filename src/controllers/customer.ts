import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomerModel from "../models/customers.js";
import { redis } from "../lib/redis.js";
import { AuthRequest } from "../middleware/userAuth.js";

export const getCustomersDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { role, branchId, branches } = req.user!;

    const search = (req.query.search as string) || "";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    // 🔐 ROLE BASED BRANCH FILTER
    let branchFilter: any = {};

    if (role === "user") {
      branchFilter.branchId = branchId; // single branch
    }

    if (role === "admin") {
      branchFilter.branchId = { $in: branches }; // multi-branch
    }

    if (role === "super_admin") {
      branchFilter = {}; // no restriction
    }

    const query: any = { ...branchFilter };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const cacheKey = `customers:${role}:${JSON.stringify(
      branchFilter
    )}:${search}:${page}:${limit}`;

    // 🔴 Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const [data, total] = await Promise.all([
      CustomerModel.find(
        query,
        { _id: 1, name: 1, mobile: 1, comment: 1, date: 1, branchId: 1 }
      )
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

    // 🟢 Cache 30s
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
