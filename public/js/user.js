import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let secretKey = null;

// Passphrase form
const passphraseForm = document.getElementById("passphrase-form");
passphraseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  secretKey = document.getElementById("passphrase").value.trim();
  if (secretKey) {
    alert("Passphrase set!");
    console.log(`[${new Date().toLocaleString()}] Passphrase set.`);
  }
});

// Logout
let loggingOut = false;
const logout_btn = document.getElementById("logout");
logout_btn.addEventListener("click", async () => {
  try {
    loggingOut = true;
    await signOut(auth);
    console.log(`[${new Date().toLocaleString()}] User logged out.`);
    window.location.href = "login.html";
  } catch (error) {
    alert(`Logout Failed: ${error.message}`);
    console.log(`[${new Date().toLocaleString()}] Logout failed: ${error.message}`);
  }
});

// Helpers
function hash(text) {
  return CryptoJS.SHA256(text + secretKey).toString();
}

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[decryption failed]";
  }
}

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user && !loggingOut) {
    alert("You must log in first!");
    console.log(`[${new Date().toLocaleString()}] Unauthorized access - redirecting to login.`);
    window.location.href = "login.html";
  } else if (user) {
    console.log(`[${new Date().toLocaleString()}] User logged in: ${user.email}`);
  }
});

// Search
const queryForm = document.getElementById("query-form");
const resultsDiv = document.getElementById("results");

queryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!secretKey) {
    alert("You must enter a Passphrase before searching for a POI!");
    console.log(`[${new Date().toLocaleString()}] Search attempted without passphrase.`);
    return;
  }

  const keyword = document.getElementById("keyword").value.trim().toLowerCase();
  console.log(`[${new Date().toLocaleString()}] Search initiated for: ${keyword}`);

  try {
    const keywordHash = hash(keyword);
    const q = query(collection(db, "pois"), where("categoryHash", "==", keywordHash));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      resultsDiv.innerHTML = `<p>No results found for: ${keyword}</p>`;
      console.log(`[${new Date().toLocaleString()}] No results found for: ${keyword}`);
      return;
    }

    let html = "<ul>";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const decryptedCategory = decrypt(data.categoryEnc);
      html += `<li>
        <strong>${data.name}</strong> — Category: ${decryptedCategory} — Location: (${data.location.lat}, ${data.location.lng})
      </li> <br>`;
    });
    html += "</ul>";

    resultsDiv.innerHTML = html;
    console.log(`[${new Date().toLocaleString()}] Search results displayed for: ${keyword}`);
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    console.log(`[${new Date().toLocaleString()}] Error during search: ${err.message}`);
  }
});
