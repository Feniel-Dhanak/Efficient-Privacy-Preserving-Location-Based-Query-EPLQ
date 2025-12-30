// public/js/utils.js - small helpers
export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
export function byId(id){ return document.getElementById(id); }

export function notify(el, msg, type="info"){
  if(!el) return;
  el.textContent = msg;
  el.className = `notice ${type}`;
  el.hidden = false;
  setTimeout(()=>{ el.hidden = true; }, 4000);
}

export function haversineKm(lat1, lon1, lat2, lon2){
  const toRad = d => d * Math.PI/180;
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function requireAuthGuard(){
  const uid = sessionStorage.getItem("uid");
  if(!uid){
    window.location.href = "/login.html";
  }
}

export function formatKm(km){
  return km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(2)} km`;
}
