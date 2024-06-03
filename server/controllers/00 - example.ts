import { Request as Req, Response as Res, NextFunction as Next } from "express";
import UserModel, { IUser } from "../models/user.model";
import OrderModel, { IOrder } from "../models/order.model";
import CourseModel, { ICourse } from "../models/course.model";
import NotificationModel, { INotification } from "../models/notification.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { redis } from "../utils/redis";

export const testController = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Test controller",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
