import express, { Express } from "express";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";
import {
  createLayout,
  getLayout,
  getLayoutByType,
  updateLayout,
} from "../controllers/layout.controller";

const layoutRouter = express.Router();

layoutRouter.post("/", isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRouter.get("/", isAuthenticated, authorizeRoles("admin"), getLayout);
layoutRouter.put("/", isAuthenticated, authorizeRoles("admin"), updateLayout);
layoutRouter.get("/:type", getLayoutByType);

export default layoutRouter;
