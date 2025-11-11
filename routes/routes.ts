import express from "express"
import { get } from "../controllers/controllers";
const router= express.Router();



router.get("/",get);



export default router;