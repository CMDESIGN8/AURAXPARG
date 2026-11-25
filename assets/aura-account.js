/* AURA XP ACCOUNT — Firebase Authentication + Firestore progress sync */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile,
  GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6sVrVsArVZEARA5JQjND4xxtGKRCLE0Q",
  authDomain: "aura-xp-dd6d3.firebaseapp.com",
  projectId: "aura-xp-dd6d3",
  storageBucket: "aura-xp-dd6d3.firebasestorage.app",
  messagingSenderId: "484718037800",
  appId: "1:484718037800:web:b0713ffb61833505185e1d"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = "es";

const STORAGE_KEYS = [
  "auraxp-start-7day-progress-v1",
  "auraxp-pro-21day-progress-v2",
  "auraxp-elite-30day-progress-v1",
  "aura-player-evolution-v1",
  "auraxp-achievements-v1",
  "auraxp-start-7day-intro-v1",
  "auraxp-pro-21day-intro-v1",
  "auraxp-elite-30day-intro-v1"
];

let activeUser = null;
let syncReady = false;
let syncTimer = null;
let currentMode = "login";
let pendingDisplayName = "";

const styles = `
#aura-account-root{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(2,7,14,.88);backdrop-filter:blur(14px);font-family:Montserrat,Arial,sans-serif;color:#f4f8fb}
#aura-account-root.is-visible{display:flex}
#aura-account-card{width:min(100%,460px);max-height:calc(100vh - 40px);overflow:auto;position:relative;padding:30px 28px 26px;border:1px solid rgba(8,201,244,.38);background:linear-gradient(145deg,rgba(10,24,38,.98),rgba(4,8,16,.99));box-shadow:0 24px 90px rgba(0,0,0,.55),inset 0 0 38px rgba(8,201,244,.045)}
#aura-account-card:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,#08c9f4,#b7ff3c)}
.aura-account-kicker{display:block;color:#08c9f4;font-size:10px;font-weight:900;letter-spacing:2px;margin-bottom:12px}
#aura-account-card h2{font-size:clamp(24px,6vw,32px);line-height:1.05;font-weight:900;letter-spacing:-1px;margin:0 0 10px;text-transform:uppercase}
#aura-account-card .aura-account-copy{font-size:13px;line-height:1.65;color:#a9b8c7;margin:0 0 22px}
#aura-account-form label{display:block;margin:14px 0 7px;font-size:10px;font-weight:800;letter-spacing:1px;color:#b9c9d7;text-transform:uppercase}
#aura-account-form input{display:block;width:100%;height:48px;padding:0 13px;border:1px solid rgba(255,255,255,.15);border-radius:3px;background:rgba(255,255,255,.055);color:#fff;font:500 14px Montserrat,Arial,sans-serif;outline:none}
#aura-account-form input:focus{border-color:#08c9f4;box-shadow:0 0 0 3px rgba(8,201,244,.1)}
#aura-account-submit{width:100%;height:50px;margin-top:20px;border:0;border-radius:3px;background:linear-gradient(100deg,#08c9f4,#56dfff);color:#03111a;font-size:12px;font-weight:900;letter-spacing:1px;cursor:pointer}
#aura-account-submit:disabled{opacity:.6;cursor:wait}
#aura-account-google{width:100%;height:48px;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:11px;border:1px solid rgba(255,255,255,.2);border-radius:3px;background:#fff;color:#202124;font:700 12px Arial,sans-serif;cursor:pointer}
#aura-account-google:hover{background:#f3f6fa}
#aura-account-google svg{width:18px;height:18px;flex:none}
.aura-account-or{display:flex;align-items:center;gap:12px;margin:15px 0 2px;color:#718394;font-size:9px;font-weight:800;letter-spacing:1.5px}
.aura-account-or:before,.aura-account-or:after{content:"";height:1px;flex:1;background:rgba(255,255,255,.12)}
#aura-account-error{min-height:18px;margin:12px 0 0;color:#ff9a9a;font-size:11px;line-height:1.5}
#aura-account-switch{display:flex;justify-content:center;gap:5px;flex-wrap:wrap;margin-top:14px;color:#9aabba;font-size:11px}
#aura-account-switch button,#aura-account-forgot{padding:0;border:0;background:none;color:#08c9f4;font:800 11px Montserrat,Arial,sans-serif;cursor:pointer}
#aura-account-forgot{display:block;margin:14px auto 0}
#aura-account-legal{margin-top:20px;color:#718394;font-size:10px;line-height:1.55;text-align:center}
#aura-account-status{position:fixed;z-index:1200;top:14px;right:16px;display:none;align-items:center;gap:9px;padding:8px 10px;border:1px solid rgba(8,201,244,.3);background:rgba(4,12,22,.9);color:#eaf8ff;font:800 10px Montserrat,Arial,sans-serif;letter-spacing:.4px;backdrop-filter:blur(12px)}
#aura-account-status.is-visible{display:flex}
#aura-account-status span{max-width:145px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#aura-account-status button{border:0;background:none;color:#08c9f4;font:900 9px Montserrat,Arial,sans-serif;cursor:pointer}
#aura-account-toast{position:fixed;z-index:2147483001;left:50%;bottom:22px;transform:translate(-50%,14px);padding:12px 16px;border:1px solid rgba(8,201,244,.45);background:#071725;color:#eafaff;font:800 11px Montserrat,Arial,sans-serif;opacity:0;pointer-events:none;transition:.25s}
#aura-account-toast.is-visible{opacity:1;transform:translate(-50%,0)}
@media(max-width:600px){#aura-account-card{padding:26px 20px 22px}#aura-account-status{top:8px;right:8px}}
`;

const style = document.createElement("style");
style.textContent = styles;
document.head.appendChild(style);

const root = document.createElement("div");
root.id = "aura-account-root";
root.innerHTML = `
  <section id="aura-account-card" role="dialog" aria-modal="true" aria-labelledby="aura-account-title">
    <span class="aura-account-kicker">AURA XP // PLAYER ID</span>
    <h2 id="aura-account-title">Tu evolución<br>te acompaña.</h2>
    <p class="aura-account-copy" id="aura-account-copy">Creá tu cuenta para guardar tus jornadas, XP y logros, y continuar desde cualquier dispositivo.</p>
    <form id="aura-account-form" novalidate>
      <div id="aura-account-name-wrap">
        <label for="aura-account-name">Nombre de jugador</label>
        <input id="aura-account-name" name="displayName" type="text" maxlength="24" autocomplete="nickname" placeholder="Tu nickname">
      </div>
      <label for="aura-account-email">Email</label>
      <input id="aura-account-email" name="email" type="email" autocomplete="email" required placeholder="tu@email.com">
      <label for="aura-account-password">Contraseña</label>
      <input id="aura-account-password" name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="Mínimo 8 caracteres">
      <button id="aura-account-submit" type="submit">CREAR MI CUENTA</button>
      <div class="aura-account-or">O CONTINUÁ CON</div>
      <button id="aura-account-google" type="button"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.98 46.98 31.92 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continuar con Google</button>
      <p id="aura-account-error" role="alert"></p>
    </form>
    <button id="aura-account-forgot" type="button">RECUPERAR CONTRASEÑA</button>
    <div id="aura-account-switch"><span>¿Ya tenés cuenta?</span><button type="button">INICIAR SESIÓN</button></div>
    <p id="aura-account-legal">Tu progreso se sincroniza de forma privada con tu cuenta AURA XP. Podés cerrar sesión cuando quieras.</p>
  </section>`;
document.body.appendChild(root);

const status = document.createElement("div");
status.id = "aura-account-status";
status.innerHTML = `<span id="aura-account-user"></span><button id="aura-account-logout" type="button">CERRAR SESIÓN</button>`;
document.body.appendChild(status);

const toast = document.createElement("div");
toast.id = "aura-account-toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.appendChild(toast);

const $ = id => document.getElementById(id);
const form = $("aura-account-form");
const errorNode = $("aura-account-error");
const nameWrap = $("aura-account-name-wrap");
const submit = $("aura-account-submit");
const googleButton = $("aura-account-google");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function setMode(mode) {
  currentMode = mode;
  const registering = mode === "register";
  $("aura-account-title").innerHTML = registering ? "Tu evolución<br>te acompaña." : "Volvé a tu<br>evolución.";
  $("aura-account-copy").textContent = registering
    ? "Creá tu cuenta para guardar tus jornadas, XP y logros, y continuar desde cualquier dispositivo."
    : "Iniciá sesión para recuperar tu progreso, tus logros y tus recompensas.";
  nameWrap.hidden = !registering;
  $("aura-account-name").required = registering;
  $("aura-account-password").autocomplete = registering ? "new-password" : "current-password";
  submit.textContent = registering ? "CREAR MI CUENTA" : "INICIAR SESIÓN";
  $("aura-account-forgot").hidden = registering;
  $("aura-account-switch").querySelector("span").textContent = registering ? "¿Ya tenés cuenta?" : "¿Todavía no tenés cuenta?";
  $("aura-account-switch").querySelector("button").textContent = registering ? "INICIAR SESIÓN" : "CREAR CUENTA";
  errorNode.textContent = "";
}
$("aura-account-switch").querySelector("button").addEventListener("click", () => setMode(currentMode === "register" ? "login" : "register"));

function friendlyError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "Ese email ya tiene una cuenta. Iniciá sesión.",
    "auth/invalid-email": "Revisá el formato del email.",
    "auth/weak-password": "La contraseña debe tener al menos 8 caracteres.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/user-not-found": "No encontramos una cuenta con ese email.",
    "auth/wrong-password": "Email o contraseña incorrectos.",
    "auth/too-many-requests": "Hubo demasiados intentos. Esperá unos minutos y volvé a probar.",
    "auth/network-request-failed": "No pudimos conectar. Revisá tu conexión.",
    "auth/operation-not-allowed": "El registro por email todavía no está habilitado en Firebase.",
    "auth/unauthorized-domain": "Este dominio todavía no está autorizado en Firebase Authentication.",
    "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar.",
    "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes y reintentá.",
    "auth/account-exists-with-different-credential": "Ya existe una cuenta con este email usando otro método. Iniciá sesión con ese método primero."
  };
  return messages[code] || "No pudimos completar la operación. Probá nuevamente.";
}

function readLocalSnapshot() {
  const storage = {};
  STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) storage[key] = value;
  });
  return storage;
}

function applySnapshot(storage = {}) {
  STORAGE_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(storage, key)) localStorage.setItem(key, storage[key]);
    else localStorage.removeItem(key);
  });
}

async function syncInitialProgress(user) {
  const progressRef = doc(db, "users", user.uid, "private", "auraProgress");
  const remote = await getDoc(progressRef);
  if (remote.exists() && remote.data()?.storage && typeof remote.data().storage === "object") {
    // Si ya existe una cuenta, la nube es la fuente de verdad: no mezclar datos
    // locales de otra cuenta que pudiera haber usado este mismo dispositivo.
    applySnapshot(remote.data().storage);
  } else {
    // Primera cuenta en este dispositivo: migrar el progreso local existente.
    await setDoc(progressRef, {
      storage: readLocalSnapshot(),
      schemaVersion: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  window.dispatchEvent(new Event("aura:progress-updated"));
}

async function syncProgress() {
  if (!activeUser || !syncReady) return;
  const progressRef = doc(db, "users", activeUser.uid, "private", "auraProgress");
  await setDoc(progressRef, {
    storage: readLocalSnapshot(),
    schemaVersion: 1,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

function scheduleSync() {
  if (!activeUser || !syncReady) return;
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncProgress().catch(error => {
      console.error("AURA XP: error sincronizando el progreso.", error);
      showToast("No se pudo sincronizar. Revisá tu conexión.");
    });
  }, 500);
}
window.addEventListener("aura:progress-updated", scheduleSync);

async function ensureProfile(user) {
  const profileRef = doc(db, "users", user.uid);
  const profile = await getDoc(profileRef);
  const payload = {
    uid: user.uid,
    email: user.email || "",
    displayName: pendingDisplayName || user.displayName || "Jugador AURA",
    photoURL: user.photoURL || "",
    updatedAt: serverTimestamp()
  };
  if (!profile.exists()) payload.createdAt = serverTimestamp();
  await setDoc(profileRef, payload, { merge: true });
}

googleButton.addEventListener("click", async () => {
  errorNode.textContent = "";
  googleButton.disabled = true;
  googleButton.style.opacity = ".6";
  googleButton.textContent = "CONECTANDO CON GOOGLE…";
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
    // onAuthStateChanged completes profile creation and progress sync.
  } catch (error) {
    errorNode.textContent = friendlyError(error);
  } finally {
    googleButton.disabled = false;
    googleButton.style.opacity = "1";
    googleButton.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.98 46.98 31.92 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continuar con Google';
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  errorNode.textContent = "";
  if (activeUser && !syncReady) {
    submit.disabled = true;
    submit.textContent = "CARGANDO TU PROGRESO…";
    try {
      await ensureProfile(activeUser);
      await syncInitialProgress(activeUser);
      syncReady = true;
      root.classList.remove("is-visible");
      status.classList.add("is-visible");
      $("aura-account-user").textContent = activeUser.displayName || activeUser.email || "Jugador AURA";
      showToast("PROGRESO SINCRONIZADO · AURA XP");
    } catch (retryError) {
      errorNode.textContent = "Todavía no podemos guardar tu progreso. Revisá las reglas de Firestore y reintentá.";
      submit.disabled = false;
      submit.textContent = "REINTENTAR";
    }
    return;
  }
  const email = $("aura-account-email").value.trim();
  const password = $("aura-account-password").value;
  submit.disabled = true;
  submit.textContent = currentMode === "register" ? "CREANDO CUENTA…" : "INGRESANDO…";
  try {
    if (currentMode === "register") {
      const displayName = $("aura-account-name").value.trim();
      if (displayName.length < 2) throw new Error("Elegí un nombre de jugador de al menos 2 caracteres.");
      pendingDisplayName = displayName;
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
      pendingDisplayName = "";
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    errorNode.textContent = error.message?.startsWith("Elegí") ? error.message : friendlyError(error);
    submit.disabled = false;
    submit.textContent = currentMode === "register" ? "CREAR MI CUENTA" : "INICIAR SESIÓN";
  }
});

$("aura-account-forgot").addEventListener("click", async () => {
  const email = $("aura-account-email").value.trim();
  if (!email) {
    errorNode.textContent = "Ingresá tu email y después tocá recuperar contraseña.";
    return;
  }
  errorNode.textContent = "";
  try {
    await sendPasswordResetEmail(auth, email);
    errorNode.style.color = "#b7ff3c";
    errorNode.textContent = "Te enviamos un email para restablecer tu contraseña.";
  } catch (error) {
    errorNode.style.color = "#ff9a9a";
    errorNode.textContent = friendlyError(error);
  }
});

$("aura-account-logout").addEventListener("click", async () => {
  syncReady = false;
  await signOut(auth);
});

onAuthStateChanged(auth, async user => {
  syncReady = false;
  activeUser = user;
  root.classList.add("is-visible");
  status.classList.remove("is-visible");
  submit.disabled = true;
  submit.textContent = user ? "CARGANDO TU PROGRESO…" : "CREAR MI CUENTA";
  try {
    if (user) {
      await ensureProfile(user);
      await syncInitialProgress(user);
      syncReady = true;
      root.classList.remove("is-visible");
      status.classList.add("is-visible");
      $("aura-account-user").textContent = pendingDisplayName || user.displayName || user.email || "Jugador AURA";
      showToast("PROGRESO SINCRONIZADO · AURA XP");
      window.AuraAccount = { user, signOut: () => signOut(auth), sync: syncProgress };
    } else {
      setMode("register");
      submit.disabled = false;
      root.classList.add("is-visible");
      window.AuraAccount = null;
    }
  } catch (error) {
    console.error("AURA XP: no se pudo cargar la cuenta o el progreso.", error);
    errorNode.textContent = "No pudimos cargar tu progreso. Verificá la configuración de Firestore y volvé a intentar.";
    submit.disabled = false;
    submit.textContent = "REINTENTAR";
  }
});
