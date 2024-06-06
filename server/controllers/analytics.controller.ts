import { Request as Req, Response as Res, NextFunction as Next } from "express";
import UserModel, { IUser } from "../models/user.model";
import OrderModel, { IOrder } from "../models/order.model";
import CourseModel, { ICourse } from "../models/course.model";
import NotificationModel, { INotification } from "../models/notification.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";

import { generateLastYearAnalytics } from "../utils/analytics.generator";

export const userAnalytics = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const users = await generateLastYearAnalytics(UserModel);
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
export const courseAnalytics = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const courses = await generateLastYearAnalytics(CourseModel);
    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
export const ordersAnalytics = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const orders = await generateLastYearAnalytics(UserModel);
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
