import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  doc, getDoc, collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // Check if email exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No account for: ${email}`);
      return;
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get role from Firestore
    const roleRef = doc(db, "users", user.uid);
    const roleSnap = await getDoc(roleRef);

    if (roleSnap.exists()) {
      const role = roleSnap.data().role;
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "user.html";
      }
    } else {
      alert("No role found for this user. Contact Admin.");
    }

  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      alert("Incorrect password. Please try again.");
    } else {
      alert(`Login failed: ${error.message}`);
    }
  }
});
