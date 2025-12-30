import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let secretKey = null;

// Passphrase form
const passphraseForm = document.getElementById("passphrase-form");
passphraseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  secretKey = document.getElementById("passphrase").value.trim();
  if (secretKey) {
    alert("Passphrase set!");
    console.log(`[${new Date().toLocaleString()}] Admin passphrase set.`);
  }
});

// Logout
let loggingOut = false;
const logout_btn = document.getElementById("logout");
logout_btn.addEventListener("click", async () => {
  try {
    loggingOut = true;
    await signOut(auth);
    console.log(`[${new Date().toLocaleString()}] Admin logged out.`);
    window.location.href = "login.html";
  } catch (error) {
    alert(`Logout Failed ${error.message}`);
    console.log(`[${new Date().toLocaleString()}] Admin logout failed: ${error.message}`);
  }
});

// Helpers
function hash(text) {
  return CryptoJS.SHA256(text + secretKey).toString();
}

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

// Auth + role check
onAuthStateChanged(auth, async (user) => {
  if (!user && !loggingOut) {
    alert("You must log in first!");
    console.log(`[${new Date().toLocaleString()}] Unauthorized admin access - redirecting to login.`);
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Access denied. Admins only!");
    console.log(`[${new Date().toLocaleString()}] Access denied for non-admin user: ${user.email}`);
    window.location.href = "login.html";
    return;
  }

  console.log(`[${new Date().toLocaleString()}] Welcome Admin: ${user.email}`);
});

// Handle POI upload
const poiForm = document.getElementById("poi-form");
poiForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!secretKey) {
    alert("You must set a Passphrase before uploading a POI!");
    console.log(`[${new Date().toLocaleString()}] POI upload attempted without passphrase.`);
    return;
  }

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value.trim().toLowerCase();
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);

  console.log(`[${new Date().toLocaleString()}] Uploading POI: ${name}, Category: ${category}`);

  try {
    const categoryHash = hash(category);
    const categoryEnc = encrypt(category);

    await addDoc(collection(db, "pois"), {
      name,
      categoryHash,
      categoryEnc,
      location: { lat, lng },
      createdAt: new Date().toISOString()
    });

    alert("POI added successfully!");
    console.log(`[${new Date().toLocaleString()}] POI successfully added: ${name}`);
    poiForm.reset();
  } catch (err) {
    alert("Error adding POI: " + err.message);
    console.log(`[${new Date().toLocaleString()}] Error adding POI: ${err.message}`);
  }
});
