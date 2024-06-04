import express, { Express } from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  deleteOldNotif,
  getAllNotif,
  readNotif,
} from "../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get("/all", isAuthenticated, getAllNotif);
notificationRouter.put("/read/:id", isAuthenticated, readNotif);
notificationRouter.delete("/delete-old", isAuthenticated, deleteOldNotif);

export default notificationRouter;
