import mongoose, { Schema } from "mongoose";
import type { IProfile } from "../types/types.js";

const ProfileSchema: Schema<IProfile> = new Schema<IProfile>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"],
    },
    name: {
      type: String,
      required: true,
      maxlength: 50,
      default:"def name"
    },
    busname: {
      type: String,
      required: true,
      maxlength: 70,
      default: "def bname",
    },
    phone: {
      type: String,
      required: true,
      maxlength: 15,
      default: "0000000000",
    },
    address: {
      type: String,
      required: true,
      maxlength: 100,
      default: "def address",
    },
    city: {
      type: String,
      required: true,
      maxlength: 50,
      default: "def city",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lang: {
      type: String,
      required: true,
      enum: ["urdu", "eng"],
      default: "eng",
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
  { collection: "profiles", versionKey: false }
);

const ProfileModel =
  mongoose.models.IProfile ||
  mongoose.model<IProfile>("profiles", ProfileSchema);

export default ProfileModel;
