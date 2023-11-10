import { Router } from "express";
import {
  signInController,
  updateUserInfoController,
  getUserProfile,
  resetPasswordRequestController,
  resetPasswordController,
  getMyProfile,
  followController,
  getPromotedUsersContoller,
} from "../controllers/userController.js";
import validateToken from "../../middleware/index.js";
import permissionGranter from "../../middleware/permissionGranter.js";
const userRoutes = Router();

userRoutes.post("/", signInController);
userRoutes.post("/reset-password-request", resetPasswordRequestController);
userRoutes.post("/reset-password/:token", resetPasswordController);
userRoutes.get("/user/my-profile", validateToken, getMyProfile);
userRoutes.get("/:id", permissionGranter, getUserProfile);
userRoutes.patch("/update-user", validateToken, updateUserInfoController);
userRoutes.patch("/follow", validateToken, followController);
userRoutes.get("/promotion/users",  getPromotedUsersContoller);

export default userRoutes;
