import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { Response } from "express";
import { redis } from "./redis";

export interface IuserRegister {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}

export interface ITokenOptions {
  maxAge: number;
  httpOnly: boolean;
  sameSite: "strict" | "none" | "lax" | undefined;
  secure?: boolean;
}

const accessTokenExpire = Number(process.env.ACCESS_TOKEN_EXPIRE! || 15);
const refreshTokenExpire = Number(process.env.REFRESH_TOKEN_EXPIRE! || 3);

export const accessTokenOptions: ITokenOptions = {
  maxAge: accessTokenExpire * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production" ? true : false,
};

export const refreshTokenOptions: ITokenOptions = {
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const createActivationToken = (
  user: IuserRegister
): {
  activationCode: string;
  token: string;
} => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET!,
    { expiresIn: process.env.ACTIVATION_EXPIRE! }
  );

  return { token, activationCode };
};

export const createForgotPasswordToken = (
  user: IUser
): {
  resetCode: string;
  token: string;
} => {
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    { user, resetCode },
    process.env.RESET_PASSWORD_SECRET!,
    { expiresIn: process.env.RESET_PASSWORD_EXPIRE! }
  );

  return { token, resetCode };
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accesToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //upload session token to redis
  redis.set(user._id, JSON.stringify(user));

  //Prepare the cookie options
  res.cookie("access_Token", accesToken, accessTokenOptions);
  res.cookie("refresh_Token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    accesToken,
    refreshToken,
    user,
  });
};
