import express from 'express';
import { addTransaction, createStripeUser } from '../controllers/transactionController.js';
import validateToken from '../../middleware/validateToken.js';

const stripeRouter = express.Router();

stripeRouter.post('/add-transaction', validateToken, addTransaction);
stripeRouter.post('/create-stripe-user', validateToken, createStripeUser);

export default stripeRouter;