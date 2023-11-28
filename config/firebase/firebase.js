import admin from 'firebase-admin';
import dotenv from "dotenv";
import { credentials } from './divine-actor-401115-firebase-adminsdk-idzjw-dcd7edb75c.js';
dotenv.config();

const api_key = process.env.FIREBASE_API_KEY;
const auth_domain = process.env.FIREBASE_AUTH_DOMAIN;
const project_id = process.env.FIREBASE_PROJECT_ID;
const storage_bucket = process.env.FIREBASE_STORAGE_BUCKET;
const messenger_sender_id = process.env.FIREBASE_MESSENGER_SENDER_ID;
const app_id = process.env.FIREBASE_APP_ID;

// export default admin.initializeApp({
//   apiKey: api_key,
//   authDomain: auth_domain,
//   projectId: project_id,
//   storageBucket: storage_bucket,
//   messagingSenderId: messenger_sender_id,
//   appId: app_id
// });


export default admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

export const db = admin.firestore()

// export const bucket = admin.storage().bucket();
