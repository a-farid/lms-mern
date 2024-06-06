import express, { Express } from "express";
import { userRegister } from "../controllers/user.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";

const testRouter = express.Router();

testRouter.post("/new", userRegister);

export default testRouter;
