import { Router } from "express";
import validateToken from "../../middleware/validateToken.js";
import { getPromotionData } from "../controllers/promotionController.js";
const promotionRoutes = Router();

promotionRoutes.get('/', getPromotionData);

export default promotionRoutes;