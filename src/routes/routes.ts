import express from "express";
// import {
//   dashboard,
//   postSignUp,
//   postSignIn,
//   postSignOut,
//   postUserVerified,
// } from "../controllers/controllers.js";
import authRoutes from "./auth/auth.js"

const router = express.Router();

// router.post("/auth/signup", postSignUp);
// router.post("/auth/verify", postUserVerified);
// router.post("/auth/signin", postSignIn);
// router.post("/auth/signout", postSignOut);
router.use("/auth", authRoutes);

export default router;
