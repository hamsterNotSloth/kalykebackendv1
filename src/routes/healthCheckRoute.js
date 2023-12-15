import { Router } from "express";
import { serverHealthCheck } from "../controllers/healthCheckController.js";
const healthCheckRoutes = Router();

healthCheckRoutes.get("/status", serverHealthCheck)   

export default healthCheckRoutes;