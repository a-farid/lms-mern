import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

// export const catchAsyncErrors =
//   (fn: any) => async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await fn(req, res, next);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   };

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

// const catchAsyncErrors =
//   (fn: any) => (req?: Request, res?: Response, next?: NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
