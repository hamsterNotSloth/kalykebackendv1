import admin from 'firebase-admin';
import dotenv from "dotenv";
dotenv.config();

const api_key = process.env.FIREBASE_API_KEY;
const auth_domain = process.env.FIREBASE_AUTH_DOMAIN;
const project_id = process.env.FIREBASE_PROJECT_ID;
const storage_bucket = process.env.FIREBASE_STORAGE_BUCKET;
const messenger_sender_id = process.env.FIREBASE_MESSENGER_SENDER_ID;
const app_id = process.env.FIREBASE_APP_ID;

export default admin.initializeApp({
  apiKey: api_key,
  authDomain: auth_domain,
  projectId: project_id,
  storageBucket: storage_bucket,
  messagingSenderId: messenger_sender_id,
  appId: app_id
});

export const bucket = admin.storage().bucket();
