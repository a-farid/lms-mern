import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { describe } from "node:test";

interface IuserRegister {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}
interface IActivationRequest {
  activationCode: string;
  activationToken: string;
}

export const createActivationToken = (
  user: IuserRegister
): {
  activationCode: string;
  token: string;
} => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    { user, activationCode },
    process.env.JWT_SECRET || "mysecret",
    {
      expiresIn: process.env.JWT_EXPIRE || "1d",
    }
  );

  return { token, activationCode };
};

// Register a user
export const userRegister = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });

      if (isEmailExist)
        return next(new ErrorHandler("Email already exists", 400));

      const user: IuserRegister = {
        name,
        email,
        password,
      };

      const { activationCode, token } = createActivationToken(user);

      const data = { name, activationCode };
      // const html = await ejs.renderFile(
      //   path.join(__dirname, "../mails/activation-mail.ejs"),
      //   data
      // );
      try {
        await sendMail({
          email: user.email,
          subject: "Account activation for ULEARNOW",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `Account registered successfully. Please check your email ${user.email} to activate your account`,
          activationToken: token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Activation of account
export const userActivation = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { activationCode, activationToken } = req.body as IActivationRequest;
    if (!activationCode || !activationToken) {
      return next(new ErrorHandler("Invalid activation token", 400));
    }

    try {
      const newUser: { user: IuserRegister; activationCode: string } =
        jwt.verify(activationToken, process.env.JWT_SECRET!) as {
          user: IuserRegister;
          activationCode: string;
        };
      if (!newUser) {
        return next(new ErrorHandler("Invalid activation token", 400));
      }
      if (newUser.activationCode !== activationCode) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const userExist = await userModel.findOne({ email: newUser.user.email });

      if (userExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user = await userModel.create({ ...newUser.user });

      res.status(201).json({
        success: true,
        message: "Account activated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
