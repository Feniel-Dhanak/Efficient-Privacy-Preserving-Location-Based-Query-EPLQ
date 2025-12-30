// public/js/logger.js
import { auth, db, ts } from "./firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function logAction(action, details={}){
  try{
    const user = auth.currentUser;
    await addDoc(collection(db, "logs"), {
      uid: user?.uid || null,
      email: user?.email || null,
      action,
      details,
      ts: ts()
    });
  }catch(e){
    console.warn("Logging failed:", e);
  }
}
