import express from "express";
import {
  userRegister,
  userActivation,
  userLogin,
  userLogout,
  updateAccessToken,
  userProfile,
  socialLogin,
  forgotPassword,
  resetPassword,
  userUpdate,
  updatePassword,
  updateProfilePicture,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/activate", userActivation);
userRouter.post("/login", userLogin);
userRouter.get("/logout", isAuthenticated, userLogout);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, userProfile);
userRouter.post("/social-auth", socialLogin);
userRouter.post("/forget-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.put("/update", isAuthenticated, userUpdate);
userRouter.put("/update-password", isAuthenticated, updatePassword);
userRouter.put("/update-avatar", isAuthenticated, updateProfilePicture);

export default userRouter;
