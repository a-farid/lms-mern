import express, { Express } from "express";

// import userRouter from "./routes/user.root";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

/**
 * Adds middlewares to the given express application.
 * @param {express.Express} api The express application.
 */
const injectMiddlewares = (api: Express) => {
  api.use(express.json({ limit: "200mb" }));
  api.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  api.use(cookieParser());
  api.use(bodyParser.json({ limit: "50mb" }));
};

export default injectMiddlewares;
