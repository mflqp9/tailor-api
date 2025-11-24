import express from "express";
import {
  postSignUp,
  postSignIn,
  postSignOut,
  postUserVerified,
  postForgotPassword,
  postSetNewPassword,
  postAddNewUser
} from "../../controllers/controllers.js";

const router = express.Router();

router.post("/signup", postSignUp);
router.post("/verify", postUserVerified);
router.post("/signin", postSignIn);
router.post("/signout", postSignOut);
router.post("/forgot-password",postForgotPassword);
router.post("/set-password",postSetNewPassword);
router.post("/add-user",postAddNewUser);


export default router;