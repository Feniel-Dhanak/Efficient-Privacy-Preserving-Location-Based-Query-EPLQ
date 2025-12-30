import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Check password match
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // 1. Register user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Add user profile to Firestore with role = "user"
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: "user",
      createdAt: new Date().toISOString()
    });

    alert(`Account created for ${user.email}`);
    // Redirect to login page after successful registration
    window.location.href = "login.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Provided Email already in use!");
    }else{
      alert(`Registration failed: ${error.message}`);
    };
  }
});
