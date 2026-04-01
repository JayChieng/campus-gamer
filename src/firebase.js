import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6hV2ZtABDsjHzTwiJFnMa1Z64YOwyOOg",
  authDomain: "campus-gamer-app-2c890.firebaseapp.com",
  projectId: "campus-gamer-app-2c890",
  storageBucket: "campus-gamer-app-2c890.firebasestorage.app",
  messagingSenderId: "614936356849",
  appId: "1:614936356849:web:40c2439b7d17c0f501c650",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
