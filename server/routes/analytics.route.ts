import express, { Express } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  courseAnalytics,
  ordersAnalytics,
  userAnalytics,
} from "../controllers/analytics.controller";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/users",
  isAuthenticated,
  authorizeRoles("admin"),
  userAnalytics
);
analyticsRouter.get(
  "/courses",
  isAuthenticated,
  authorizeRoles("admin"),
  courseAnalytics
);
analyticsRouter.get(
  "/orders",
  isAuthenticated,
  authorizeRoles("admin"),
  ordersAnalytics
);

export default analyticsRouter;
