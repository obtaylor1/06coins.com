// Firebase client setup for real-time inventory tracking
// Reference: firebase_barebones_javascript blueprint

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getFirestore, doc, onSnapshot, type Firestore, type Unsubscribe } from "firebase/firestore";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) {
    console.warn('Firebase credentials not configured. Real-time features will be disabled.');
    return null;
  }

  if (app && auth && db) {
    return { app, auth, db };
  }

  try {
    const firebaseConfig = {
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
      appId,
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    console.log('Firebase initialized successfully');
    return { app, auth, db };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

export async function signInAnonymouslyToFirebase(): Promise<boolean> {
  const firebase = initializeFirebase();
  if (!firebase) return false;

  try {
    await signInAnonymously(firebase.auth);
    console.log('Signed in anonymously to Firebase');
    return true;
  } catch (error) {
    console.error('Failed to sign in anonymously:', error);
    return false;
  }
}

export function subscribeToInventory(
  callback: (stock: number) => void
): Unsubscribe | null {
  const firebase = initializeFirebase();
  if (!firebase) {
    console.log('Firebase not initialized - real-time updates unavailable');
    return null;
  }

  const inventoryDocRef = doc(firebase.db, 'coin_inventory', 'apa120th_coin_stock');

  return onSnapshot(
    inventoryDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const stock = data?.remaining_stock ?? 406;
        console.log('Firebase real-time update: stock =', stock);
        callback(stock);
      } else {
        console.log('Firestore document not found, using default stock');
        callback(406); // Default stock
      }
    },
    (error) => {
      console.warn('Firebase listener error (check Firestore rules allow anonymous read):', error.message);
      // Don't throw - just log and let API polling handle it
    }
  );
}
