import { Router } from "express";
import validateToken from "../../middleware/index.js";
import { createProductController, deleteProductHandler, getAllProductController, getUserProductsController, getProductController, getSimilarProductsController, productViewController } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/',validateToken, createProductController);
productRoutes.get('/similar-modals', getSimilarProductsController);
productRoutes.get('/user-products/:id', getUserProductsController);
productRoutes.get('/all-products', getAllProductController);
productRoutes.get('/:id', getProductController);
productRoutes.delete('/delete-product',validateToken, deleteProductHandler);
productRoutes.patch('/:id',validateToken, productViewController);

export default productRoutes;