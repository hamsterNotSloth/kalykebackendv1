import stripe from "stripe";
import { getErrorMessage } from "../../errors/errorMessages.js";
import transactionService from "../services/transactionService.js";
import { db } from "../../config/firebase/firebase.js";
const stripeInstance = stripe('sk_test_51OI4miLzxkeRIY0ySCCTWfE931dpYKJoi1wtWVVLAAXxMOuGueBBTyoTMxTnOv1jeWhU88Iu2N7PoGfXDdmObKY700i1ZzRIRM');


export const addTransaction = async (req, res) => {
  try {
    // const { amount } = req.body;
    console.log(req.body.productId, 'outside')
    const { email } = req.user;
    console.log(req.body, 'body')
    const session = await transactionService.createPaymentIntent(email, req.body.amount, req.body.productId);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStripeUser = async (req, res) => {
  if (req.user && !req.user.uid) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }
  if (req.user && !req.user.email) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }

  try {
    const { uid: accountId, email } = req.user;

    const response = await transactionService.createStripeUser(email, accountId);

    res.status(200).json({ accountLinkUrl: response });
  } catch (error) {
    console.error('Error creating Stripe user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const associatePayoutDetails = async (req, res) => {
  try {
    const response = await transactionService.associatePayoutDetails(email)
    res.status(200).json({ response, message: "Ok" })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}


export const webHooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, 'whsec_9ec113236c3a26adba8ff45280155141a46082feb7a1142b054ccc72fefc0303');
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      const productId = paymentIntentSucceeded.metadata.productId;
      const buyerEmail = paymentIntentSucceeded.metadata.buyerEmail;
      const productsQuery = await db.collection('products').where('_id', '==', productId).get();
      if (productsQuery.empty) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const productDoc = productsQuery.docs[0];
      const productData = productDoc.data();

      const usersQuery = await db.collection('users').where('email', '==', buyerEmail).get();
      if (usersQuery.empty) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userDoc = usersQuery.docs[0];
      const userData = userDoc.data();

      const updatedPurchaseHistory = productData.purchaseHistory
        ? [...productData.purchaseHistory, { _id: userData._id, email: userData.email, date: Date.now() }]
        : [{ _id: userData._id, email: userData.email, date: Date.now() }];

      await db.collection('products').doc(productDoc.id).update({
        purchaseHistory: updatedPurchaseHistory,
      });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};