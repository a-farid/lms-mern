import { Request, Response, NextFunction } from "express";
import { ErrorHandlerMiddleware } from "../middleware/error";
import userRouter from "./user.route";
import courseRouter from "./course.route";
import orderRouter from "./order.route";

const injectRoutes = (api: any) => {
  api.use("/api/v1/user", userRouter);
  api.use("/api/v1/course", courseRouter);
  api.use("/api/v1/order", orderRouter);

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
