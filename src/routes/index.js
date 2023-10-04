import { Router } from "express";
import userRoutes from "./userRoutes.js"; 
const Routes = Router();

Routes.use("/user", userRoutes);

export default Routes;
