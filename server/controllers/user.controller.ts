import { Request as Req, Response as Res, NextFunction as Next } from "express";
import UserModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors as Catch } from "../middleware/catchAsyncErrors";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail";
import {
  IuserRegister,
  accessTokenOptions,
  createActivationToken,
  createForgotPasswordToken,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { v2 as cloudinary } from "cloudinary";
import { SchangeUserRole, SdeleteUser } from "../services/user.service";

// Register a user: /api/user/register
export const userRegister = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { name, email, password } = req.body;
    const isEmailExist = await UserModel.findOne({ email });

    if (isEmailExist)
      return next(new ErrorHandler("Email already exists", 400));

    const user: IuserRegister = {
      name,
      email,
      password,
    };

    const { activationCode, token } = createActivationToken(user);

    const data = { name, activationCode };

    try {
      await sendMail({
        email: user.email,
        subject: "Account activation for ULEARNOW",
        template: "activation-mail.ejs",
        data,
      });
      res.status(201).json({
        success: true,
        message: `Account registered successfully. check your email`,
        activationToken: token,
        activationCodeTemp: activationCode,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Activation of account: /api/user/activate
export const userActivation = Catch(async (req: Req, res: Res, next: Next) => {
  const { activationCode, activationToken } = req.body as {
    activationCode: string;
    activationToken: string;
  };
  if (!activationCode || !activationToken) {
    return next(new ErrorHandler("Invalid activation token", 400));
  }

  try {
    const newUser: { user: IuserRegister; activationCode: string } = jwt.verify(
      activationToken,
      process.env.JWT_SECRET!
    ) as {
      user: IuserRegister;
      activationCode: string;
    };
    if (!newUser) {
      return next(new ErrorHandler("Invalid activation token", 400));
    }
    if (Number(newUser.activationCode) !== Number(activationCode)) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const userExist = await UserModel.findOne({ email: newUser.user.email });

    if (userExist) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const user = await UserModel.create({ ...newUser.user });

    res.status(201).json({
      success: true,
      message: "Account activated successfully",
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Login: /api/user/login
export const userLogin = Catch(async (req: any, res: any, next: any) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

// Logout: /api/user/logout
export const userLogout = Catch(async (req: Req, res: Res, next: Next) => {
  res.cookie("access_Token", "", { maxAge: 1 });
  res.cookie("refresh_Token", "", { maxAge: 1 });
  await redis.del(`user:${req.user?._id}`);
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Refresh access token: /api/user/refresh
export const updateToken = Catch(async (req: Req, res: Res, next: Next) => {
  const refresh_token = req.cookies.refresh_Token;
  console.log("Cookies in refresh", req.cookies);
  if (!refresh_token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  const decoded = (await jwt.verify(
    refresh_token,
    process.env.REFRESH_TOKEN!
  )) as { id: string };
  if (!decoded) return next(new ErrorHandler("Invalid token", 401));

  // const user = await UserModel.findById(decoded.id);
  const session = await redis.get(`user:${decoded.id}`);
  if (!session)
    return next(new ErrorHandler("Please login to access this route", 404));

  const user = JSON.parse(session) as IUser;

  // const accessToken = user.SignAccessToken();
  // const refreshToken = user.SignRefreshToken();
  const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN!, {
    expiresIn: `${process.env.ACCESS_TOKEN_EXPIRE!}m`,
  });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN!, {
    expiresIn: `${process.env.REFRESH_TOKEN_EXPIRE!}d`,
  });

  res.cookie("access_Token", accessToken, accessTokenOptions);
  res.cookie("refresh_Token", refreshToken, refreshTokenOptions);

  await redis.set(
    `user:${user._id}`,
    JSON.stringify(user),
    "EX",
    Number(process.env.REFRESH_TOKEN_EXPIRE!) * 24 * 60 * 60
  );

  res.status(200).json({ success: true, accessToken });
});

// Get user infos: /api/user/me
export const userProfile = Catch(async (req: Req, res: Res, next: Next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({ success: true, user });
});

// Social authentication: /api/user/social-auth
export const socialLogin = Catch(async (req: Req, res: Res, next: Next) => {
  const { name, email, avatar } = req.body as {
    name: string;
    email: string;
    avatar: string;
  };
  const user = await UserModel.findOne({ email });
  if (!user) {
    const newUser = await UserModel.create({ name, email, avatar });
    sendToken(newUser, 200, res);
  } else {
    sendToken(user, 200, res);
  }
});

// Forgot password: /api/user/forget-password
export const forgotPassword = Catch(async (req: Req, res: Res, next: Next) => {
  const { email } = req.body as { email: string };
  const user = await UserModel.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { resetCode, token } = createForgotPasswordToken(user);
  const data = { resetCode };

  try {
    await sendMail({
      email: user.email,
      subject: "Reset the password for ULEARNOW",
      template: "reset-password-mail.ejs",
      data,
    });
    res.status(201).json({
      success: true,
      message: `The reset mail was sent successfully. Please check your email ${user.email} to change your password`,
      activationToken: token,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password: /api/user/reset-password
export const resetPassword = Catch(async (req: Req, res: Res, next: Next) => {
  const { resetCode, resetToken, password } = req.body as {
    resetCode: string;
    resetToken: string;
    password: string;
  };
  console.log("Reset code", Number(resetCode));
  if (!resetCode || !resetToken) {
    return next(new ErrorHandler("Invalid reset token", 400));
  }

  try {
    const newUser: { user: IuserRegister; resetCode: string } = jwt.verify(
      resetToken,
      process.env.RESET_PASSWORD_SECRET!
    ) as {
      user: IuserRegister;
      resetCode: string;
    };
    console.log("newUser", Number(newUser.resetCode));
    if (!newUser) {
      return next(new ErrorHandler("Invalid activation token", 400));
    }
    if (Number(newUser.resetCode) !== Number(resetCode)) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const user = await UserModel.findOne({ email: newUser.user.email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.password = password;
    await user.save();

    res.status(201).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Update user infos: /api/user/update
export const userUpdate = Catch(async (req: Req, res: Res, next: Next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { name, email } = req.body as {
    name?: string;
    email?: string;
  };

  const updatedUser = (await UserModel.findById(user._id)) as IUser;
  if (name) updatedUser.name = name;
  if (email) {
    const userExist = await UserModel.findOne({ email });
    if (userExist) return next(new ErrorHandler("Email already exists", 400));
    updatedUser.email = email;
  }
  await redis.set(
    `user:${updatedUser._id}`,
    JSON.stringify(updatedUser),
    "EX",
    Number(process.env.REFRESH_TOKEN_EXPIRE!) * 24 * 60 * 60
  );
  await updatedUser.save();

  res.status(201).json({ success: true, updatedUser });
});

// Update user password: /api/user/update-password
export const updatePassword = Catch(async (req: Req, res: Res, next: Next) => {
  const { oldPassword, newPassword } = req.body as {
    oldPassword: string;
    newPassword: string;
  };
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please enter old and new password", 400));
  }

  const user = await UserModel.findById(req.user?._id).select("+password");
  if (!user) return next(new ErrorHandler("User not found", 404));

  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(201).json({ success: true, message: "Password updated" });
});

// Update profile image: /api/user/update-avatar
export const updateAvatar = Catch(async (req: Req, res: Res, next: Next) => {
  const { avatar } = req.body as { avatar: string };
  const userId = req.user?._id;
  const user = await UserModel.findById(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));
  if (user?.avatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }
  const result = await cloudinary.uploader.upload(avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  user.avatar = {
    public_id: result.public_id,
    url: result.secure_url,
  };
  await user.save();
  await redis.set(
    `user:${user._id}`,
    JSON.stringify(user),
    "EX",
    Number(process.env.REFRESH_TOKEN_EXPIRE!) * 24 * 60 * 60
  );

  res.status(200).json({
    success: true,
    message: "Avatar updated",
    avatar: user.avatar,
  });
});

// Get all users: /api/user/all (admin)
export const getAllUsers = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Change user role
export const updateRole = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { userId, role } = req.body as { userId: string; role: string };
    SchangeUserRole(res, userId, role);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Delete user
export const deleteUser = Catch(async (req: Req, res: Res, next: Next) => {
  try {
    const { userId } = req.body as { userId: string };
    SdeleteUser(res, userId, next);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
});
