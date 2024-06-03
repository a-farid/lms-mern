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
import { findOneById } from "../services/custom.service";

export const createOrder = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { courseId, payment_info } = req.body as IOrder;
    const course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));

    const user = await UserModel.findById(req.user?.id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const isCoursePurchased = findOneById(courseId, user.courses);
    if (isCoursePurchased)
      return next(
        new ErrorHandler("You have already purchased this course", 400)
      );

    const newOrder = await OrderModel.create({
      userId: req.user?.id,
      courseId: courseId,
      payment_info,
    });
    const mailData = {
      _id: String(newOrder._id).slice(0, 5),
      name: course.name,
      courseName: course.name,
      price: course.price,
      date: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    try {
      await sendMail({
        email: user.email,
        subject: "Order Confirmation",
        template: "order-confirmation.ejs",
        data: mailData,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }

    user.courses.push({ courseId });
    await user.save();

    await NotificationModel.create({
      userId: user?.id,
      title: "Course Purchased",
      message: `You have successfully purchased ${course.name}`,
    });

    res.status(200).json({
      success: true,
      order: course,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
