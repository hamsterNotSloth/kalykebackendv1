import { getErrorMessage } from "../../errors/errorMessages.js";
import transactionService from "../services/transactionService.js";

export const addTransaction = async (req, res) => {
  try {
    // const { amount } = req.body;
    const {email} = req.user;
    const session = await transactionService.createPaymentIntent(email);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStripeUser = async (req, res) => {
  if(req.user && !req.user.uid) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }
  if(req.user && !req.user.email) {
    return res.status(400).json({ message: getErrorMessage(400), status: false })
  }
  
  try {
    const {uid: accountId, email} = req.user;
    
    const response = await transactionService.createStripeUser(email, accountId);

    res.status(200).json({ accountLinkUrl: response });
  } catch (error) {
    console.error('Error creating Stripe user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const associatePayoutDetails = async(req, res) => {
  try {
    const response = await transactionService.associatePayoutDetails(email)
    res.status(200).json({response, message: "Ok"})
  } catch(error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}