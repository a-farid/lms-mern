import NotificationModel from "../models/notification.model";
import UserModel from "../models/user.model";

export const sendNotif = async (id: string, title: string, message: string) =>
  await NotificationModel.create({
    userId: id,
    title,
    message,
  });

export const sendNotifToAdmins = async (title: string, message: string) => {
  const admins = await UserModel.find({ role: "admin" });
  admins.forEach(async (admin: any) => {
    await NotificationModel.create({
      userId: admin._id,
      title,
      message,
    });
  });
};
