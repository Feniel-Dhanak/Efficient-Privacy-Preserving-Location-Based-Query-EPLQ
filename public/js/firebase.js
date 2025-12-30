// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcsR9wcl1FQUP8UGHnrpkV1zGYOuaFQRA",
  authDomain: "eplq-lbs.firebaseapp.com",
  projectId: "eplq-lbs",
  storageBucket: "eplq-lbs.firebasestorage.app",
  messagingSenderId: "139728403005",
  appId: "1:139728403005:web:32d833278dc0653e054854"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// Export what you need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ts = serverTimestamp;
