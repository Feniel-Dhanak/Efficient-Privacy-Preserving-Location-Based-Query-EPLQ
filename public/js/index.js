import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const adminCard = document.querySelector('a[href="admin.html"]');
  const userCard = document.querySelector('a[href="user.html"]');

  // Check authentication state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      if (adminCard) {
        adminCard.addEventListener("click", (e) => {
          e.preventDefault();
          alert("You must log in first to access Admin page!");
        });
      }
      if (userCard) {
        userCard.addEventListener("click", (e) => {
          e.preventDefault();
          alert("You must log in first to access User page!");
        });
      }
    } else {
      console.log(`Logged in as: ${user.email}`);
    }
  });
});
