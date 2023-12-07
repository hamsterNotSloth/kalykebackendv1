import { Router } from "express";
import userRoutes from "./userRoutes.js"; 
import productRoutes from "./productRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import stripeRouter from "./transactionRoutes.js";
import promotionRoutes from "./promotionRoutes.js";

const Routes = Router();
Routes.use("/user", userRoutes);
Routes.use("/product", productRoutes);
Routes.use('/stripe', stripeRouter)
Routes.use('/promotion', promotionRoutes)

export default Routes;
