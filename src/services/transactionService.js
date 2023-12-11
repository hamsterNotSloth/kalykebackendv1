import { db } from '../../config/firebase/firebase.js';
import stripe from 'stripe';
import dotenv from "dotenv";
import axios from "axios"
dotenv.config();
const stripe_secret = process.env.STRIPE_SECRET_KEY_YATHRATH_TEST;
const stripeInstance = stripe(stripe_secret);
const appUrl = process.env.APP_URL
const plateFormFee = process.env.PLATEFORM_FEE_PERCENTAGE

const createPaymentIntent = async (email, amount, _id, countryCode, exchangeRate) => {
    const productData = await db.collection('products').where('_id', '==', _id).get();
    if (productData.empty) {
        return { message: getErrorMessage(404), status: false, code: 404 };
    }
    const product = productData.docs[0].data();
    const convertedAmount = parseInt(amount)
    const intPlateFormFee = parseInt(plateFormFee)
    const toLocalAmount = convertedAmount * exchangeRate
    const sellerMoney = Math.floor(toLocalAmount - (toLocalAmount * intPlateFormFee / 100))
    const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: countryCode, 
                    product_data: {
                        name: product.title, 
                    },
                    unit_amount: Math.floor(toLocalAmount * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        payment_intent_data: {
            transfer_data: {
                amount: Math.floor(sellerMoney * 100),
                destination: product.stripeUserId,
            },
            metadata: {
                productId: _id,
                buyerEmail: email
            },
        },
        success_url: `${appUrl}/messages/success?productId=${_id}`,
        cancel_url: `${appUrl}/products/${_id}`,
    });

    return session;
};

const createStripeUser = async (email, accountId) => {
    try {
        const userRaw = await db.collection('users').where('email', '==', email).get();
        const userData = userRaw.docs[0].data()
        const accountLink = await stripeInstance.accountLinks.create({
            account: userData.stripeUserId,
            refresh_url: `${appUrl}/new/test/refersh`,
            return_url: `${appUrl}/user/${userData.u_id}`,
            type: 'account_onboarding',
        });
        const updatedAccount = await stripeInstance.accounts.retrieve(userData.stripeUserId);
        return accountLink.url;
    } catch (error) {
        console.error('Error creating Stripe user:', error.message);
        return error;
    }
};

async function saveUserIdInFirestore(accountId, stripeUserId) {
    const userRef = db.collection('users').doc(accountId);
    await userRef.set({
        stripeUserId: stripeUserId,
    }, { merge: true });

};

export default {
    createPaymentIntent,
    createStripeUser,
};
