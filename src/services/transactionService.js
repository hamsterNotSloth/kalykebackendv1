import { db } from '../../config/firebase/firebase.js';
import stripe from 'stripe';
import dotenv from "dotenv";
dotenv.config();
const stripe_secret = process.env.STRIPE_SECRET_KEY_YATHRATH_TEST;
const stripeInstance = stripe(stripe_secret);

const createPaymentIntent = async (email, amount, _id) => {
    const productData = await db.collection('products').where('_id', '==', _id).get();
    if (productData.empty) {
        return { message: getErrorMessage(404), status: false, code: 404 };
    }
    const product = productData.docs[0].data();
    console.log(product, 'product') 

    const convertedAmount = parseInt(amount)
    const minimumAmount = 0.5;
    const adjustedAmount = Math.max(convertedAmount, minimumAmount);
    const plateformPercentage = (20 / 100) * convertedAmount;
    const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: "3d Model",
                    },
                    unit_amount: adjustedAmount * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        payment_intent_data: {
            application_fee_amount: Math.round(plateformPercentage * 100),
            transfer_data: {
                destination: product.stripeUserId,
            },
            metadata: {
                productId: _id,
                buyerEmail: email
            },
        },
        success_url: `http://localhost:3000/messages/success?productId=${_id}`,
        cancel_url: 'http://localhost:3000/cancel',
    });

    return session;
};

const createStripeUser = async (email, accountId) => {
    try {
        const userRaw = await db.collection('users').where('email', '==', email).get();
        const userData = userRaw.docs[0].data()
        const accountLink = await stripeInstance.accountLinks.create({
            account: userData.stripeUserId,
            refresh_url: 'http://localhost:3000/new/test/refersh',
            return_url: `http://localhost:3000/user/${userData.u_id}`,
            type: 'account_onboarding',
        });
        const updatedAccount = await stripeInstance.accounts.retrieve(userData.stripeUserId);
        return accountLink.url;
    } catch (error) {
        console.error('Error creating Stripe user:', error.message);
        throw error;
    }
};

export default {
    createPaymentIntent,
    createStripeUser,
};
