import { Router } from "express";
import userRoutes from "./userRoutes.js"; 
import productRoutes from "./productRoutes.js";

const Routes = Router();
Routes.use("/user", userRoutes);
Routes.use("/product", productRoutes);

export default Routes;
