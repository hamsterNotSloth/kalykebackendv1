import express from 'express';
import { addTransaction, createStripeUser, webHooks } from '../controllers/transactionController.js';
import validateToken from '../../middleware/validateToken.js';
import axios from 'axios';

const stripeRouter = express.Router();

stripeRouter.post('/add-transaction', validateToken, addTransaction);
stripeRouter.post('/create-stripe-user', validateToken, createStripeUser);
stripeRouter.post('/webhook', express.raw({type: 'application/json'}), webHooks)

export default stripeRouter;