// @ts-nocheck
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { auth_store } from './auth_store'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const signIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    auth_store.update(currentState => {
        return { ...currentState, user: result.user };
    });
    return result.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    auth_store.update(currentState => {
        return { ...currentState, user: null, user_db: null };
    });
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export { auth };