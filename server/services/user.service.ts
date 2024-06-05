import { NextFunction, Response } from "express";
import UserModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { v2 as cloudinary } from "cloudinary";
import { redis } from "../utils/redis";

export const SchangeUserRole = async (
  res: Response,
  userId: string,
  role: string
) => {
  const user = await UserModel.findById(userId);
  if (!user) return new ErrorHandler("User not found", 404);
  user.role = role;
  await user.save();
  res.status(201).json({
    succes: true,
    user,
  });
};
export const SdeleteUser = async (
  res: Response,
  userId: string,
  next: NextFunction
) => {
  const user = await UserModel.findById(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));
  if (user.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }
  await user.deleteOne();
  await redis.del(`user:${userId}`);

  res.status(204).json({
    succes: true,
    message: "User deleted succesfully !!!",
  });
};
