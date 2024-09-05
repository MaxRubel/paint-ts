// @ts-nocheck
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { authStore } from './auth_store'
import { CheckUser } from '../../api/user';
import { get } from 'svelte/store';
import { event_state_store } from '../../stores/eventState';
import { alert_store } from '../../stores/alertStore';

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
    const googleUser = await signInWithPopup(auth, provider);
    const djangoUser = await CheckUser(googleUser.user.uid)
    if (djangoUser?.id) {
      authStore.setUser({ ...googleUser.user, ...djangoUser })
    } else {
      authStore.setUser(googleUser.user)
    }
    alert_store.set("alert: Sign-in succesful!")
    return googleUser.user;
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    authStore.clearUser();
    alert_store.set("alert: You are logged out!")
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export { auth };