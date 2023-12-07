import { getErrorMessage } from "../../errors/errorMessages.js";
import promotionService from "../services/promotionService.js";

export const getPromotionData = async (req, res) => {
    try {
        const response = await promotionService.getPromotionData()
        res.status(200).json(response)
    } catch(error) {
        return res.status(500).json({ message: getErrorMessage(500), status: false });
    }
}