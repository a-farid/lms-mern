import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  courseId: string;
  payment_info: object;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      ref: "Course",
      required: true,
    },
    payment_info: {
      type: Object,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel: Model<IOrder> = mongoose.model("Order", orderSchema);

export default OrderModel;
