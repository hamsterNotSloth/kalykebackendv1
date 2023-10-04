import { Router } from "express";
import {
  createUserController,
  loginController,
  updateUserInfoController,
  getUserProfile,
} from "../controllers/userController.js";
import validateToken from "../../middleware/index.js";
const userRoutes = Router();

userRoutes.post("/login", loginController);
userRoutes.post("/createUser", createUserController);
userRoutes.patch("/update-user", validateToken, updateUserInfoController);
userRoutes.get("/user-profile", validateToken, getUserProfile);

export default userRoutes;
