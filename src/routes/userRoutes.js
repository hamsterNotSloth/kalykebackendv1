import { Router } from "express";
import {
  signIn,
  updateUserInfo,
  getUserProfile,
  resetPasswordRequest,
  resetPassword,
  getMyProfile,
  follow,
  getPromotedUsers,
  serverHealthCheck,
} from "../controllers/userController.js";
import validateToken from "../../middleware/validateToken.js";
import permissionGranter from "../../middleware/permissionGranter.js";
const userRoutes = Router();

userRoutes.post("/", signIn);
userRoutes.post("/reset-password-request", resetPasswordRequest);
userRoutes.post("/reset-password/:token", resetPassword);
userRoutes.get("/user/my-profile", validateToken, getMyProfile);
userRoutes.get("/:id", permissionGranter, getUserProfile);
userRoutes.patch("/update-user", validateToken, updateUserInfo);
userRoutes.patch("/follow", validateToken, follow);
userRoutes.get("/promotion/users",  getPromotedUsers);
userRoutes.get("/health/status", serverHealthCheck)

export default userRoutes;