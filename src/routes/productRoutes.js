import { Router } from "express";
import validateToken from "../../middleware/validateToken.js";
import { createProduct, deleteProduct, getAllProduct, getUserProducts, getProduct, getSimilarProducts, productView, getAllSearchedProducts, addComments, deleteComment } from "../controllers/productController.js";
const productRoutes = Router();

productRoutes.post('/',validateToken, createProduct);
productRoutes.get('/similar-modals', getSimilarProducts);
productRoutes.get('/user-products/:id', getUserProducts);
productRoutes.get('/all-products', getAllProduct);
productRoutes.get('/:id', getProduct);
productRoutes.get('/search/products', getAllSearchedProducts);
productRoutes.delete('/delete-product',validateToken, deleteProduct);
productRoutes.patch('/:id',validateToken, productView);
productRoutes.patch('/:productId/comments', validateToken, addComments )
productRoutes.delete('/:productId/comments/:commentId', validateToken, deleteComment )

export default productRoutes;