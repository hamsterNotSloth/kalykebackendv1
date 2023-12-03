import { db } from '../../config/firebase/firebase.js';
import stripe from 'stripe';
const stripeInstance = stripe('sk_test_51OI4miLzxkeRIY0ySCCTWfE931dpYKJoi1wtWVVLAAXxMOuGueBBTyoTMxTnOv1jeWhU88Iu2N7PoGfXDdmObKY700i1ZzRIRM');

const createPaymentIntent = async (email) => {

    const userData = await db.collection('users').where('email', '==', email).get();
    if (userData.empty) {
        return { message: getErrorMessage(404), status: false, code: 404 };
    }
    const stripeUserId = userData.docs[0].data().stripeUserId;
    // const paymentIntent = await stripeInstance.paymentIntents.create({
    //     amount,
    //     currency: 'usd',
    //     application_fee_amount: calculateApplicationFee(amount),
    //     transfer_data: {
    //         destination: stripeUserId,
    //     },
    // });
    const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: "New 3d model",
                    },
                    unit_amount: 10000,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        payment_intent_data: {
            application_fee_amount: 1000,
            transfer_data: {
                destination: 'acct_1OJ941PrdvuEPXd8',
            },
        },
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
    });


    console.log(session, 'paymentIntent.client_secret')
    return session;
};

const calculateApplicationFee = (amount) => {
    return Math.floor(amount * 0.1);
};

const createStripeUser = async (email, accountId) => {
    try {
        const user = await stripeInstance.accounts.create({
            type: 'express',
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
        });
        await saveUserIdInFirestore(accountId, user.id);

        const accountLink = await stripeInstance.accountLinks.create({
            account: user.id,
            refresh_url: 'http://localhost:3000/new/test/refersh',
            return_url: 'http://localhost:3000/user/Z6vz2U4nJsa67tJebw8zl038Y6O2',
            type: 'account_onboarding',
          });
          console.log(accountLink, ':accountLink:')

        return accountLink.url;
    } catch (error) {
        console.error('Error creating Stripe user:', error.message);
        throw error;
    }
};

const saveUserIdInFirestore = async (accountId, stripeUserId) => {
    console.log(stripeUserId, 'stripeUserId')
    const userRef = db.collection('users').doc(accountId);
    await userRef.set({
        stripeUserId: stripeUserId,
    }, { merge: true });

    console.log(`Saved Stripe user ID ${stripeUserId}.`);
};

const associatePayoutDetails = async (accountId) => {
    try {
        await stripeInstance.accounts.update(accountId, {
            external_account: {
                object: 'bank_account',
                country: 'US',
                currency: 'usd',
                account_holder_name: 'John Doe',
                account_holder_type: 'individual',
                routing_number: '110000000',
                account_number: '000123456789',
            },
        });
        console.log(`Payout details associated with account ${accountId}`);
    } catch (error) {
        console.error('Error associating payout details:', error.message);
        throw error;
    }
};

export default {
    createPaymentIntent,
    createStripeUser,
    associatePayoutDetails
};
