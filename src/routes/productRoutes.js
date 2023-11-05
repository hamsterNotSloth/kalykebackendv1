import { Router } from "express";
import validateToken from "../../middleware/index.js";
import { createProductController, deleteProductHandler, getAllProductController, getUserProductsController, getProductController } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/',validateToken, createProductController);
productRoutes.get('/user-products/:id', getUserProductsController);
productRoutes.get('/all-products', getAllProductController);
productRoutes.get('/:id', getProductController);
productRoutes.delete('/delete-product',validateToken, deleteProductHandler);

export default productRoutes;