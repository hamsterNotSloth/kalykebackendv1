import { Router } from "express";
import {
  signInController,
  updateUserInfoController,
  getUserProfile,
  resetPasswordRequestController,
  resetPasswordController,
} from "../controllers/userController.js";
import validateToken from "../../middleware/index.js";
const userRoutes = Router();

userRoutes.post("/", signInController);
userRoutes.patch("/update-user", validateToken, updateUserInfoController);
userRoutes.get("/", validateToken, getUserProfile);
userRoutes.post("/reset-password-request", resetPasswordRequestController);
userRoutes.post("/reset-password/:token", resetPasswordController);

export default userRoutes;
