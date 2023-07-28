import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "house-marketplace-app-baf77.firebaseapp.com",
  projectId: "house-marketplace-app-baf77",
  storageBucket: "house-marketplace-app-baf77.appspot.com",
  messagingSenderId: "332265786181",
  appId: "1:332265786181:web:f33ba16b435e51718f0c2c",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
