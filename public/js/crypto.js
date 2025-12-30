// public/js/crypto.js - AES-GCM + PBKDF2 key derivation
import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let cryptoKey = null;
let currentSalt = null;

async function getOrCreateSalt(){
  const ref = doc(db, "settings", "crypto");
  const snap = await getDoc(ref);
  if(snap.exists()){
    const data = snap.data();
    if(data?.salt){
      return Uint8Array.from(atob(data.salt), c=>c.charCodeAt(0));
    }
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  await setDoc(ref, { salt: btoa(String.fromCharCode(...salt)) }, { merge: true });
  return salt;
}

export async function deriveKey(passphrase){
  currentSalt = await getOrCreateSalt();
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  cryptoKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: currentSalt,
      iterations: 150000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt","decrypt"]
  );
  return true;
}

export function hasKey(){ return !!cryptoKey; }

export async function encryptString(plaintext){
  if(!cryptoKey) throw new Error("Key not derived. Set passphrase.");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, enc.encode(plaintext));
  const payload = {
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
    ct: btoa(String.fromCharCode(...new Uint8Array(ct)))
  };
  return payload;
}

export async function decryptString(payload){
  if(!cryptoKey) throw new Error("Key not derived. Set passphrase.");
  try{
    const iv = Uint8Array.from(atob(payload.iv), c=>c.charCodeAt(0));
    const ct = Uint8Array.from(atob(payload.ct), c=>c.charCodeAt(0));
    const ptBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ct);
    return new TextDecoder().decode(ptBuf);
  }catch(e){
    return null;
  }
}
