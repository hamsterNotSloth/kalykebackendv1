import { Router } from "express";
import validateToken from "../../middleware/validateToken.js";
import { createProduct, deleteProduct, getAllProduct, getUserProducts, getProduct, getSimilarProducts, productView } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/',validateToken, createProduct);
productRoutes.get('/similar-modals', getSimilarProducts);
productRoutes.get('/user-products/:id', getUserProducts);
productRoutes.get('/all-products', getAllProduct);
productRoutes.get('/:id', getProduct);
productRoutes.delete('/delete-product',validateToken, deleteProduct);
productRoutes.patch('/:id',validateToken, productView);

export default productRoutes;