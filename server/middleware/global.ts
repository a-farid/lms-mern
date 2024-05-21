import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";

/**
 * Adds middlewares to the given express application.
 * @param {express.Express} api The express application.
 */
const injectMiddlewares = (api: Express) => {
  api.use(express.json({ limit: "200mb" }));
  api.use(morgan("dev"));
  api.use(helmet());
  api.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  api.use(cookieParser());
};

export default injectMiddlewares;
