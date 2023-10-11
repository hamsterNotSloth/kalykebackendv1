import { Router } from "express";
import {
  createUserController,
  loginController,
  updateUserInfoController,
  getUserProfile,
  resetPasswordRequestController,
  resetPasswordController,
} from "../controllers/userController.js";
import validateToken from "../../middleware/index.js";
const userRoutes = Router();

userRoutes.post("/login", loginController);
userRoutes.post("/createUser", createUserController);
userRoutes.patch("/update-user", validateToken, updateUserInfoController);
userRoutes.get("/user-profile", validateToken, getUserProfile);
userRoutes.post("/reset-password-request", resetPasswordRequestController);
userRoutes.post("/reset-password/:token", resetPasswordController);

export default userRoutes;
