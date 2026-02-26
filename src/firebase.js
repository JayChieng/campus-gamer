import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-rdjxGS6RNCm-Q8UeiUoqyMRj2Co0j2o",
  authDomain: "campus-gamer-app.firebaseapp.com",
  projectId: "campus-gamer-app",
  storageBucket: "campus-gamer-app.firebasestorage.app",
  messagingSenderId: "798028445759",
  appId: "1:798028445759:web:af4d434de2b0de79ece08a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);