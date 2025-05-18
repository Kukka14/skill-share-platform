import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: `AIzaSyDa7Q-2FshuNDcRqocRc5T1dYI6UXLXMfc`, // Get this from Firebase Console > Project Settings > Web App
  authDomain: "skill-share-app-236ad.firebaseapp.com",
  projectId: "skill-share-app-236ad",
  storageBucket: "skill-share-app-236ad.appspot.com",
  messagingSenderId: "112173408859911227685",
  appId: `skill-share-app-236ad` // Get this from Firebase Console > Project Settings > Web App
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
}); 