import { Router } from "express";
import {
  signIn,
  updateUserInfo,
  getUserProfile,
  getMyProfile,
  follow,
  wishList,
  getWishListItems,
  getUserDownloadableItems,
} from "../controllers/userController.js";
import validateToken from "../../middleware/validateToken.js";
import permissionGranter from "../../middleware/permissionGranter.js";
const userRoutes = Router();

userRoutes.post("/", signIn);
userRoutes.get("/user/my-profile", validateToken, getMyProfile);
userRoutes.get("/:id", permissionGranter, getUserProfile);
userRoutes.patch("/update-user", validateToken, updateUserInfo);
userRoutes.patch("/follow", validateToken, follow);
userRoutes.post("/wishlist", validateToken, wishList)
userRoutes.get("/wishlist/products", validateToken, getWishListItems)
userRoutes.get('/user/downloadable-products', validateToken, getUserDownloadableItems);


export default userRoutes;