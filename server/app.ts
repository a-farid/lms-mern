require("dotenv").config();
import express from "express";
export const app = express();

import injectRoutes from "./routes";
import injectMiddlewares from "./middleware/global";

injectMiddlewares(app);
injectRoutes(app);
