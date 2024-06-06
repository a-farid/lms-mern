import express, { Express } from "express";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";
import { createLayout } from "../controllers/layout.controller";

const layoutRouter = express.Router();

layoutRouter.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin"),
  createLayout
);

export default layoutRouter;
