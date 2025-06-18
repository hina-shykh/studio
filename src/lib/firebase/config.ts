
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

const requiredConfigs: Record<string, string | undefined> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
  // storageBucket, messagingSenderId, and appId are often optional for basic auth/firestore
  // but it's good practice to have them for a full setup.
  // Add them here if they are strictly necessary for your app's core functionality.
};

let allConfigsPresent = true;
for (const key in requiredConfigs) {
  if (!requiredConfigs[key]) {
    console.error(
      `Firebase config error: ${key} is missing in .env.local. ` +
      'Please check your environment variables. Refer to README.md for setup instructions.'
    );
    allConfigsPresent = false;
  }
}

if (allConfigsPresent) {
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
  };

  try {
    const currentApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    app = currentApp;
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    console.error(
      "This usually means your Firebase configuration in .env.local is incorrect or incomplete."
    );
    allConfigsPresent = false; // Mark as not fully initialized
  }
}

if (!allConfigsPresent) {
  console.warn(
    'Firebase was not initialized due to missing or incorrect configuration. ' +
    'Firebase-dependent features may not work.'
  );
  // app, auth, db will remain undefined.
  // Downstream code should handle this, e.g. AuthContext shows a loading/error state.
}

export { app, auth, db };
