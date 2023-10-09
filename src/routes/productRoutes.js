import { Router } from "express";
import validateToken from "../../middleware/index.js";
import { createProductController } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/create-product',validateToken, createProductController);


export default productRoutes;