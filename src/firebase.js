// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTIoADHII__ybmNYVa8b1PjzxLoaunyIs",
  authDomain: "frontend-vue-cce89.firebaseapp.com",
  projectId: "frontend-vue-cce89",
  storageBucket: "frontend-vue-cce89.firebasestorage.app",
  messagingSenderId: "476396269281",
  appId: "1:476396269281:web:d591680ada855a51b311a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };