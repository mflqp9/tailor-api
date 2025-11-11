import { Request,Response } from "express";

const get= async (req:Request,res:Response):Promise<void>=>{
res.send("congratulations you are using now a live api.");
}

export {get};