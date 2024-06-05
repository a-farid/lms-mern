import { Request as Req, Response as Res, NextFunction as Next } from "express";
import UserModel from "../models/user.model";
import OrderModel, { IOrder } from "../models/order.model";
import CourseModel from "../models/course.model";
import NotificationModel from "../models/notification.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";
import sendMail from "../utils/sendMail";
import { sendNotif } from "../services/notification.service";
import { getAllOrders } from "../services/order.service";

export const createOrder = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { courseId, payment_info } = req.body as IOrder;
    const userId = req.user?._id;
    const course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found", 404));
    log.magenta("User: ", userId);
    const user = await UserModel.findOne({ _id: userId });
    log.gray("User db: ", user);

    if (!user) return next(new ErrorHandler("User not found", 404));

    const isCoursePurchased = user.courses.find((c) => c.courseId === courseId);

    if (isCoursePurchased)
      return next(
        new ErrorHandler("You have already purchased this course", 400)
      );

    const order = await OrderModel.create({ userId, courseId, payment_info });
    const mailData = {
      _id: String(order).slice(0, 5),
      name: user.name,
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

    course.perchased += 1;
    await course.save();
    sendNotif(
      user._id,
      "Course Purchased",
      `You have successfully purchased ${course.name}`
    );

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getOrders = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    getAllOrders(res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
