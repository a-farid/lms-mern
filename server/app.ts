require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import { ErrorHandlerMiddleware } from "./middleware/error";
export const app = express();
import userRouter from "./routes/user.root";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(ErrorHandlerMiddleware);

//Routes API:
app.use("/api/v1/user", userRouter);

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ message: "Hello World" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route with url ${req.originalUrl} not found`);
  res.status(404);
  next(err);
});