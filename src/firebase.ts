import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, query, collection, getDocs, limit, where, getDocFromServer, getCountFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOvRYD9b22JU9gKAW21jkEkFHqRHJXo6I",
  authDomain: "notional-strand-7sx2c.firebaseapp.com",
  projectId: "notional-strand-7sx2c",
  storageBucket: "notional-strand-7sx2c.firebasestorage.app",
  messagingSenderId: "892640568971",
  appId: "1:892640568971:web:27c06e65a2ba635262168e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-cf007036-cfe9-43f8-b4b8-0766d5982f9d");

// Helper to validate connection as per skill guidelines
export async function validateFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'stats', 'connection-test'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    console.warn("Firebase connection status check (expected if offline / first run):", error);
  }
}

// Auth helpers
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};
