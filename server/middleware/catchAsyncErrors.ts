import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

export const catchAsyncErrors =
  (fn: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      const err = new ErrorHandler(error.message, 400);
      err.filePath = error.filePath;
      return next(err);
    }
  };
