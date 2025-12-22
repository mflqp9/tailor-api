import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomerModel from "../models/customers.js";
import { redis } from "../lib/redis.js";
import { error } from "console";


export const getCustomersDetail = async (req:Request, res:Response) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const cacheKey = `customers:${search}:${page}:${limit}`;

    // 🔴 Check Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { mobile: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const [data, total] = await Promise.all([
      CustomerModel.find(
        query,
        { _id: 0, name: 1, mobile: 1, comment: 1, date: 1 }
      )
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),

      CustomerModel.countDocuments(query)
    ]);

    const response = {
      succeed: true,
      message: "Customers fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
      error: null
    };

    // 🟢 Cache for 30 seconds
    await redis.setex(cacheKey, 30, JSON.stringify(response));

    res.json(response);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ succeed: false, message: "Server error", error: err });
  }

}
