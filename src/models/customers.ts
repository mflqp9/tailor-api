import mongoose, { Schema } from "mongoose";
import type { ICustomer } from "../types/types.js";

const CustomerSchema: Schema<ICustomer> = new Schema<ICustomer>(
  {

    name: {
      type: String,
      required: true,
      maxlength: 100,
      default: "default name",
    },
    mobile: {
      type: String,
      required: true,
      maxlength: 13,
      default: "+92300",
    },
    comment: {
      type: String,
      required: true,
      maxlength: 200,
      default: "default comment",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "customers", versionKey: false }
);

const CustomerModel =
  mongoose.models.ICustomer ||
  mongoose.model<ICustomer>("customers", CustomerSchema);

export default CustomerModel;