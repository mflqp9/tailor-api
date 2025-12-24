import express from "express";
import {
  SignUp,
  SignIn,
  SignOut,
  UserProfileVerification,
  ForgotPassword,
  SetNewPassword,
  AddNewUser
} from "../../controllers/controllers.js";
import { UserAuth} from "../../middleware/userAuth.js";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/verify", UserProfileVerification);
router.post("/signin", SignIn);
router.post("/signout", SignOut);
router.post("/forgot-password",ForgotPassword);
router.post("/set-password",SetNewPassword);
router.post("/add-user",UserAuth, AddNewUser);


export default router;