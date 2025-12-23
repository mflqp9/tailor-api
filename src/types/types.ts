export type ConnectionObject = {
  isConnected?: number;
  name?:string;
}
import { StatusCodes } from "http-status-codes";
import { Document } from "mongoose";

 interface ICustomer extends Document {
  branchid:string;
  name: string;
  mobile:string;
  comment:string;
  date: Date;
}

 interface IProfile extends Document {
  name: string;
  email: string;
  busname:string;
  phone:string;
  address:string;
  city:string;
  isVerified:boolean;
  isActive:boolean;
  lang:string;
  createdAt: Date;
  updatedAt: Date;
}

interface IUser extends Document  {
email: string;
password: string;
role: string;
branchId: string;
isActive: boolean;
createdAt: Date;
updatedAt: Date;
}

interface IAuthResponse extends Document {
  token: string;
  user: IUser;
}
interface ILogin extends Document {
  email: string;
  password: string;
  confirmPassword?: string;
  branchid?:string;
} 

interface ResponseOptions {
  succeed?: boolean;
  statusCode?: StatusCodes;
  message?: string;
  data?: any;
  error?: any;
}

export type {IProfile, IUser, IAuthResponse, ILogin, ResponseOptions, ICustomer };