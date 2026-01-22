import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration for BD Sync Firebase Project
const firebaseConfig = {
  apiKey: "AIzaSyB5INPJHrhJ6A2NoT2CEx_znz6p61GX2cM",
  authDomain: "bd-sync-24ff6.firebaseapp.com",
  projectId: "bd-sync-24ff6",
  storageBucket: "bd-sync-24ff6.firebasestorage.app",
  messagingSenderId: "998544595140",
  appId: "1:998544595140:web:70ad2445265511dbab9191"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();