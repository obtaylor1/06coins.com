// Firebase Admin SDK setup for Firestore integration
// NOTE: For production, use service account credentials
// For now, using project ID only (limited functionality)

import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let firebaseApp: App | null = null;
let db: Firestore | null = null;

export function initializeFirebase(): Firestore | null {
  // Check for Firebase project ID (minimum required)
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.warn('FIREBASE_PROJECT_ID not provided. Server-side Firestore sync disabled.');
    console.warn('Set FIREBASE_PROJECT_ID to enable inventory sync to Firestore.');
    return null;
  }

  try {
    // Check if app is already initialized
    if (getApps().length === 0) {
      // Initialize with just project ID (works in some environments)
      // For full production, should use service account credentials
      firebaseApp = initializeApp({
        projectId,
      });
      db = getFirestore(firebaseApp);
      console.log('Firebase Admin SDK initialized with project:', projectId);
    } else {
      db = getFirestore();
    }
    
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    console.warn('Continuing without Firestore sync. Inventory will use in-memory storage only.');
    return null;
  }
}

export function getFirestoreDB(): Firestore | null {
  if (!db) {
    db = initializeFirebase();
  }
  return db;
}

// Firestore collection and document paths
export const INVENTORY_COLLECTION = 'coin_inventory';
export const INVENTORY_DOC_ID = 'apa120th_coin_stock';

export async function getInventoryFromFirestore(): Promise<number | null> {
  const firestore = getFirestoreDB();
  if (!firestore) return null;

  try {
    const docRef = firestore.collection(INVENTORY_COLLECTION).doc(INVENTORY_DOC_ID);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      return data?.remaining_stock ?? null;
    }
    return null;
  } catch (error) {
    console.error('Error reading from Firestore:', error);
    return null;
  }
}

export async function updateInventoryInFirestore(remainingStock: number): Promise<boolean> {
  const firestore = getFirestoreDB();
  if (!firestore) return false;

  try {
    const docRef = firestore.collection(INVENTORY_COLLECTION).doc(INVENTORY_DOC_ID);
    await docRef.set({
      remaining_stock: remainingStock,
      last_updated: new Date().toISOString(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error writing to Firestore:', error);
    return false;
  }
}
