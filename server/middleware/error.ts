import ErrorHandler from "../utils/errorHandler";
import { NextFunction, Request, Response } from "express";

export const ErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.statusCode === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 404);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid. Try again`;
    err = new ErrorHandler(message, 404);
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired. Try again`;
    err = new ErrorHandler(message, 401);
  }
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};
