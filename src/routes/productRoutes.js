import { Router } from "express";
import validateToken from "../../middleware/index.js";
import { createProductController, deleteProductHandler, downloadImageController, getAllProductController, getMyProductsController, getProductController } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/',validateToken, createProductController);
productRoutes.get('/my-products',validateToken, getMyProductsController);
productRoutes.get('/all-products', getAllProductController);
productRoutes.get('/:id', getProductController);
productRoutes.delete('/delete-product',validateToken, deleteProductHandler);
productRoutes.post('/download-image',downloadImageController);

export default productRoutes;