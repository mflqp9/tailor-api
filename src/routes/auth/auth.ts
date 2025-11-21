import express from "express";
import {
  postSignUp,
  postSignIn,
  postSignOut,
  postUserVerified,
} from "../../controllers/controllers.js";

const router = express.Router();

router.post("/signup", postSignUp);
router.post("/verify", postUserVerified);
router.post("/signin", postSignIn);
router.post("/signout", postSignOut);


export default router;