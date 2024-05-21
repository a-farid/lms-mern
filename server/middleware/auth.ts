import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncErrors";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/errorHandler";

export const isAuthenticated = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const at = req.cookies.access_Token;
    if (!at) {
      return next(new ErrorHandler("Login first to access this resource", 401));
    }

    const decoded = jwt.verify(at, process.env.ACCESS_TOKEN!) as JwtPayload;
    if (!decoded) return next(new ErrorHandler("Invalid token", 401));

    const user = await redis.get(`user:${decoded.id}`);
    if (!user) return next(new ErrorHandler("User not found in Redis DB", 401));

    req.user = JSON.parse(user);
    next();
  }
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role (${req.user?.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
