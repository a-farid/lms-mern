import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import jwt from "jsonwebtoken";
import ejs from "ejs";

interface IRegister {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const userRegister = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password }: IRegister = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegister = {
        name,
        email,
        password,
      };

      const { activationCode } = createActivationToken(user);
      const data = {
        user: name,
        activationCode,
      };
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const createActivationToken = (
  user: IRegister
): { token: string; activationCode: string } => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign({ user, activationCode }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE!,
  });

  return { token, activationCode };
};
