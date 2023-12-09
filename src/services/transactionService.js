import { db } from '../../config/firebase/firebase.js';
import stripe from 'stripe';
import dotenv from "dotenv";
import axios from "axios"
dotenv.config();
const stripe_secret = process.env.STRIPE_SECRET_KEY_YATHRATH_TEST;
const stripeInstance = stripe(stripe_secret);
const appUrl = process.env.APP_URL
const plateFormFee = process.env.PLATEFORM_FEE_PERCENTAGE


const getExchangeRate = async (fromCurrency, toCurrency) => {
    const apiKey = 'YOUR_OPEN_EXCHANGE_RATES_API_KEY'; // Replace with your API key

    try {
        const response = await axios.get(`https://open.er-api.com/v6/latest/${fromCurrency}?apikey=${apiKey}`);
        const rates = response.data.rates;

        if (toCurrency in rates) {
            return rates[toCurrency];
        } else {
            throw new Error(`Exchange rate not available for ${toCurrency}`);
        }
    } catch (error) {
        console.error(`Error fetching exchange rate: ${error.message}`);
        throw error;
    }
};


const createPaymentIntent = async (email, amount, _id, countryCode, exchangeRate) => {
    const productData = await db.collection('products').where('_id', '==', _id).get();
    if (productData.empty) {
        return { message: getErrorMessage(404), status: false, code: 404 };
    }
    const product = productData.docs[0].data();
    const convertedAmount = parseInt(amount)
    const intPlateFormFee = parseInt(plateFormFee)
    const toLocalAmount = convertedAmount * exchangeRate
    const sellerMoney = toLocalAmount - (toLocalAmount * intPlateFormFee / 100)
    const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: countryCode, 
                    product_data: {
                        name: product.title, 
                    },
                    unit_amount: Math.round(toLocalAmount),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        payment_intent_data: {
            // application_fee_amount: 600,
            transfer_data: {
                amount: Math.round(sellerMoney),
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
        let stripeUser;
        if (!userData.stripeUserId) {
            stripeUser = await stripeInstance.accounts.create({
                type: 'standard',
            });
            await saveUserIdInFirestore(userData.u_id, stripeUser.id);
        }
        if(userData.stripeUserId) {
            stripeUser=userData.stripeUserId
        }
        const accountLink = await stripeInstance.accountLinks.create({
            account: stripeUser.id || stripeUser,
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
