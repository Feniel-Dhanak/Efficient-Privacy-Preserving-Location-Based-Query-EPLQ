// public/js/auth.js
import { auth } from "./firebase.js";
import { logAction } from "./logger.js";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function initAuthWatcher(redirectIfAuthed=null){
  onAuthStateChanged(auth, (user)=>{
    if(user){
      sessionStorage.setItem("uid", user.uid);
      if(redirectIfAuthed) window.location.href = redirectIfAuthed;
    }else{
      sessionStorage.removeItem("uid");
    }
  });
}

export async function register(email, password){
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await logAction("register", { email });
  return cred.user;
}

export async function login(email, password){
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await logAction("login", { email });
  return cred.user;
}

export async function logout(){
  const email = auth.currentUser?.email || null;
  await signOut(auth);
  await logAction("logout", { email });
  sessionStorage.removeItem("uid");
  window.location.href = "/login.html";
}
