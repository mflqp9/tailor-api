import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomerModel from "../models/customers.js";
import { redis } from "../lib/redis.js";

export const getCustomersDetail = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const branchId = req.query.branchId as string; // ✅ branchId
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    if (!branchId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        succeed: false,
        message: "branchId is required",
      });
    }

    const cacheKey = `customers:${branchId}:${search}:${page}:${limit}`;

    // 🔴 Check Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // ✅ BASE QUERY (WHERE branchId = ?)
    const query: any = {
      branchId, // 🔥 THIS IS THE WHERE CONDITION
    };

    // ✅ SEARCH CONDITION
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      CustomerModel.find(
        query,
        { _id: 1, name: 1, mobile: 1, comment: 1, date: 1 }
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

    // 🟢 Cache for 30 seconds
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
