import express, { Express } from "express";
import { createOrder } from "../controllers/order.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const orderRouter = express.Router();

orderRouter.post("/create", isAuthenticated, createOrder);

export default orderRouter;
