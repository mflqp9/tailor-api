import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/types.js";

const UserSchema:Schema<IUser> = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
      maxlength: 100,
  },
  role: {
      type: String,
      required: true,
        enum: ["superAdmin","admin", "user"],

  },
    branchId: {
        type: String,
        required: true,
        unique: true ,
        // format: /^[A-Z0-9]{6}$/,
    },
  isActive: {
      type: Boolean,
      default: true,
  },
  createdAt: {
      type: Date,
      default: Date.now,
  },
  updatedAt: {
      type: Date,
      default: Date.now,
  },
},
  { collection: "users",versionKey: false },
);

const UserModel = mongoose.models.IUser || mongoose.model<IUser>("users", UserSchema);

export default UserModel;
