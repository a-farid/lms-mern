require("dotenv").config();
import injectRoutes from "./routes";
import injectMiddlewares from "./middleware/global";

import express from "express";
export const app = express();

injectMiddlewares(app);
injectRoutes(app);
