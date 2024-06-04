import { Request as Req, Response as Res, NextFunction as Next } from "express";
import NotificationModel, { INotification } from "../models/notification.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";
import cron from "node-cron";

export const getAllNotif = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const notifications = await NotificationModel.find({
      user: req.user?.id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const readNotif = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);
    if (!notification) {
      return next(new ErrorHandler("Notification not found", 404));
    }

    if (String(notification?.userId) !== String(req.user?._id)) {
      return next(
        new ErrorHandler(
          "You are not authorized to update this notification",
          401
        )
      );
    }
    notification.status = "read";
    await notification.save();
    const notifications = await NotificationModel.find({
      userId: req.user?._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

cron.schedule("0 0 0 * * *", async () => {
  try {
    const date = new Date(
      Date.now() -
        Number(process.env.NOTIFICATION_DEADLINE || 7) * 24 * 60 * 60 * 1000
    );
    await NotificationModel.deleteMany({
      status: "read",
      createdAt: { $lt: date },
    });
    log.info("Old notifications deleted successfully");
  } catch (error: any) {
    log.error(error);
  }
});

export const deleteOldNotif = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const notifications = await NotificationModel.find({
      user: req.user?.id,
    });
    let count = 0;
    notifications.forEach(async (notification) => {
      if (
        notification.createdAt <
        new Date(
          Date.now() -
            Number(process.env.NOTIFICATION_DEADLINE || 7) * 24 * 60 * 60 * 1000
        )
      ) {
        count++;
        await NotificationModel.findByIdAndDelete(notification._id);
      }
    });
    if (count === 0) {
      res.status(200).json({
        success: false,
        message: "No old notifications to delete",
      });
    }
    res.status(200).json({
      success: true,
      message: "Old notifications deleted successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});
