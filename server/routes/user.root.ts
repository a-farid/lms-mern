import express from "express";
import { userRegister, userActivation } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/activate", userActivation);

export default userRouter;
