import { Response } from "express";
import OrderModel from "../models/order.model";

export const getAllOrders = async (res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  return res.status(201).json({
    success: true,
    count: orders.length,
    orders,
  });
};
