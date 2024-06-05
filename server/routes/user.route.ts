import express from "express";
import {
  userRegister,
  userActivation,
  userLogin,
  userLogout,
  updateToken,
  userProfile,
  socialLogin,
  forgotPassword,
  resetPassword,
  userUpdate,
  updatePassword,
  updateAvatar,
  deleteUser,
  getAllUsers,
  updateRole,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/activate", userActivation);
userRouter.post("/login", userLogin);
userRouter.get("/logout", isAuthenticated, userLogout);
userRouter.get("/refresh", updateToken);
userRouter.get("/me", isAuthenticated, userProfile);
userRouter.post("/social-auth", socialLogin);
userRouter.post("/forget-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.put("/update", isAuthenticated, userUpdate);
userRouter.put("/update-password", isAuthenticated, updatePassword);
userRouter.put("/update-avatar", isAuthenticated, updateAvatar);
userRouter.delete("/one", isAuthenticated, authorizeRoles("admin"), deleteUser);
userRouter.get("/all", isAuthenticated, authorizeRoles("admin"), getAllUsers);
userRouter.put("/role", isAuthenticated, authorizeRoles("admin"), updateRole);

export default userRouter;
