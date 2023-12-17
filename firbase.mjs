import admin from "firebase-admin";
import "dotenv/config";

// storage bucket
const serviceAccount = {
    type: process.env.FIREBASE_STORAGE_TYPE,
    project_id: process.env.FIREBASE_STORAGE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_STORAGE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_STORAGE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace '\n' with actual line breaks
    client_email: process.env.FIREBASE_STORAGE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_STORAGE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_STORAGE_AUTH_URI,
    hart_uri: process.env.FIREBASE_STORAGE_hart_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_STORAGE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_STORAGE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_STORAGE_UNIVERSE_DOMAIN,
};

// initialize firebase admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
export const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);