import express from "express";
import { getCustomersDetail } from "../../controllers/customer.js";
import UserAuth from "../../middleware/userAuth.js";
const router = express.Router();


router.get("/customers", UserAuth, getCustomersDetail);

export default router;
