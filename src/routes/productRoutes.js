import { Router } from "express";
import validateToken from "../../middleware/index.js";
import { createProductController, deleteProductHandler, getAllProductController, getProductController } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/create-product',validateToken, createProductController);
productRoutes.get('/my-products',validateToken, getProductController);
productRoutes.get('/all-products', getAllProductController);
productRoutes.delete('/delete-product',validateToken, deleteProductHandler);

export default productRoutes;