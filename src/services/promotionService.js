import { db } from '../../config/firebase/firebase.js';

const getPromotionData = async () => {
    try {
        const promotionCollection = db.collection('promotion');

        const snapshot = await promotionCollection.get();

        const promotionData = [];
        snapshot.forEach(doc => {
            promotionData.push(doc.data());
        });

        return promotionData
    } catch(error) {
        return res.status(500).json({ message: getErrorMessage(500), status: false });
    }
}

export default {
    getPromotionData,
  };
  