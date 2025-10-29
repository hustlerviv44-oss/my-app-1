'use node';
import { action } from "./_generated/server";
import { v } from "convex/values";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK using the secure key from environment variables
// NOTE: Ensure your FIREBASE_SERVICE_ACCOUNT_KEY is set in Convex dashboard
let firebaseAdminApp: admin.app.App | null = null;

function initializeFirebaseAdmin() {
  if (firebaseAdminApp) return firebaseAdminApp;
  
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return firebaseAdminApp;
}

// Action to send a notification to a specific device token
export const sendPushNotification = action({
  args: {
    token: v.string(), // The FCM subscription token for the device
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const app = initializeFirebaseAdmin();
    const messaging = app.messaging();

    const message = {
      notification: {
        title: args.title,
        body: args.body,
      },
      token: args.token,
    };

    try {
      const response = await messaging.send(message);
      console.log('Successfully sent message:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});