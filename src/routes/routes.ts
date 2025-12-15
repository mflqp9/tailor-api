import express from "express";

import authRoutes from "./auth/auth.js"
import custRoutes from "./cust/cust.js"
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/cust", custRoutes);

export default router;
