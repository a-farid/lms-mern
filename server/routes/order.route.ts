import express, { Express } from "express";
import { createOrder, getOrders } from "../controllers/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const orderRouter = express.Router();

orderRouter.post("/create", isAuthenticated, createOrder);
orderRouter.get("/all", isAuthenticated, authorizeRoles("admin"), getOrders);

export default orderRouter;
