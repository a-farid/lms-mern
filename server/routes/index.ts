import { Request, Response, NextFunction } from "express";
import { ErrorHandlerMiddleware } from "../middleware/error";
import userRouter from "./user.route";
import courseRouter from "./course.route";

/**
 * Injects routes with their handlers to the given Express application.
 * @param {Express} api
 */
const injectRoutes = (api: any) => {
  api.use("/api/v1/user", userRouter);
  api.use("/api/v1/course", courseRouter);

  // Catch all route
  api.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(
      `${req.method}: route with url ${req.originalUrl} not found`
    );
    res.status(404);
    next(err);
  });
  api.use(ErrorHandlerMiddleware);
};

export default injectRoutes;
