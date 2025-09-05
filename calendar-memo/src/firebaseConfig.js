import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDbxvz3AxvUczGDdDRhPxJan5qoJiEZc_8',
  authDomain: 'note-a1c7a.firebaseapp.com',
  projectId: 'note-a1c7a',
  storageBucket: 'note-a1c7a.appspot.com',
  messagingSenderId: '351378192707',
  appId: '1:351378192707:web:9437f049c5b8f35fec97f6',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
