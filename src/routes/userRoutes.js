import { Router } from "express";
import {
  signInController,
  updateUserInfoController,
  getUserProfile,
  resetPasswordRequestController,
  resetPasswordController,
  getMyProfile,
} from "../controllers/userController.js";
import validateToken from "../../middleware/index.js";
import permissionGranter from "../../middleware/permissionGranter.js";
const userRoutes = Router();

userRoutes.post("/", signInController);
userRoutes.patch("/update-user", validateToken, updateUserInfoController);
userRoutes.get("/user/my-profile", validateToken, getMyProfile);
userRoutes.get("/:id", permissionGranter, getUserProfile);
userRoutes.post("/reset-password-request", resetPasswordRequestController);
userRoutes.post("/reset-password/:token", resetPasswordController);

export default userRoutes;
