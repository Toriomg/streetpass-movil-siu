// www/js/main.js
import { WatchUI } from "./modules/ui/watchUI.js";
import { MobileUI } from "./modules/ui/mobileUI.js";
import { socketManager } from "./core/socketManager.js";
import { uiRouter } from "./core/uiRouter.js";
import { initGestures, lockGestures } from "./modules/gestures.js";

const params = new URLSearchParams(window.location.search);
const userID = params.get("user");
const isWatch = params.get("v") === "watch";

if (!userID) {
  document.body.innerHTML =
    "<h1>Error: Debes indicar un ?user=ID en la URL</h1>";
  throw new Error("No userID provided");
}

socketManager.connect(userID);
const container = document.getElementById("app-container");

let currentUser = null;
let userProfile = null;
let nearbyQueue = [];

// Estados: "idle" | "profile" | "animating" | "match" | "connection"
let watchState = "idle";

function setWatchState(s) {
  watchState = s;
  console.log(`[Watch] estado → ${s} (cola: ${nearbyQueue.length})`);
}

function returnToIdle() {
  currentUser = null;
  setWatchState("idle");
  if (nearbyQueue.length > 0) {
    showNearbyUser(nearbyQueue.shift());
  } else {
    uiRouter.navigate("watch", userProfile);
  }
}

function closeApp() {
  currentUser = null;
  nearbyQueue = [];
  setWatchState("closed");
  uiRouter.navigate("closed", userProfile);
}

function showNearbyUser(userData) {
  currentUser = userData;
  setWatchState("profile");
  uiRouter.navigate("profile", currentUser);
}

socketManager.on("profile:data", (profile) => {
  userProfile = profile;
  initializeUI();
});

const initializeUI = () => {
  if (!userProfile) return;

  // RELOJ — pantalla principal, solo muestra
  if (isWatch) {
    const watchUI = new WatchUI(container);
    uiRouter.setInterface(watchUI);
    uiRouter.navigate("watch", userProfile);
    socketManager.identifyDevice("watch");

    // ── Panel de simulación (solo en el reloj) ──────────────────
    const debugPanel = document.getElementById("debug-panel");

    // Botón manual: una persona aparece al pulsar (también reabre si estaba cerrada)
    const triggerBtn = document.createElement("button");
    triggerBtn.textContent = "Simular persona cercana";
    triggerBtn.style.marginLeft = "8px";
    triggerBtn.addEventListener("click", () => {
      if (watchState === "closed") setWatchState("idle");
      socketManager.emit("user:nearby:trigger");
    });
    debugPanel.appendChild(triggerBtn);

    // Pre-cargar 10 personas al inicio
    for (let i = 0; i < 10; i++) {
      socketManager.emit("user:nearby:trigger");
    }

    // Botón auto-trigger: recarga la cola cada 5 segundos
    const startAuto = () => {
      return setInterval(() => {
        socketManager.emit("user:nearby:trigger");
      }, 5000);
    };

    let autoInterval = startAuto(); // arranca automáticamente
    const autoBtn = document.createElement("button");
    autoBtn.textContent = "Auto ON (5s)";
    autoBtn.style.marginLeft = "8px";
    autoBtn.addEventListener("click", () => {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        autoBtn.textContent = "Auto OFF";
      } else {
        autoInterval = startAuto();
        autoBtn.textContent = "Auto ON (5s)";
      }
    });
    debugPanel.appendChild(autoBtn);

    // Atajo de teclado: Espacio = siguiente persona (útil al grabar)
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        socketManager.emit("user:nearby:trigger");
      }
    });

    // Persona cercana detectada → mostrar si libre, encolar si ocupado, ignorar si cerrado
    socketManager.on("user:nearby", (userData) => {
      if (watchState === "closed") {
        console.log("[Watch] user:nearby ignorado — app cerrada");
        return;
      }
      if (watchState === "idle") {
        showNearbyUser(userData);
      } else {
        nearbyQueue.push(userData);
        console.log(`[Watch] user:nearby encolado (cola: ${nearbyQueue.length})`);
      }
    });

    // El reloj reacciona a todos los gestos
    socketManager.on("gesture:received", (data) => {
      switch (data.type) {

        case "accept": {
          if (watchState !== "profile" || !currentUser) break;
          const accepted = currentUser; // capturar valor, no referencia
          setWatchState("animating");
          watchUI.showSwipeIndicator("accept", () => {
            setWatchState("match");
            uiRouter.navigate("match", accepted);
            setTimeout(() => {
              setWatchState("connection");
              uiRouter.navigate("connection", accepted);
              setTimeout(() => returnToIdle(), 5000);
            }, 5000);
          });
          break;
        }

        // Pasar persona → el servidor ya manda la siguiente vía user:nearby
        case "nav": {
          if (watchState !== "profile" || !currentUser) break;
          setWatchState("animating");
          watchUI.showSwipeIndicator("reject", () => {
            lockGestures(800);
            returnToIdle();
          });
          break;
        }

        // Bloquear usuario (gesto físico) o botón del reloj → ya lo gestiona user:blocked
        case "block":
          returnToIdle();
          break;

        // Cerrar app — cualquier estado → pantalla cerrada
        case "exit":
          closeApp();
          break;

        // Ampliar rango → mensaje temporal, luego vuelve donde estaba
        case "shake": {
          if (watchState !== "profile" && watchState !== "idle") break;
          const backView = currentUser ? "profile" : "watch";
          const backData = currentUser ? currentUser : userProfile;
          uiRouter.navigate("message", {
            message: "Has ampliado el rango de búsqueda de personas",
          });
          setTimeout(() => uiRouter.navigate(backView, backData), 3000);
          break;
        }

        // Modo bloqueo activado
        case "sleep":
          returnToIdle();
          uiRouter.navigate("message", { message: "Modo bloqueo activo" });
          break;

        // Volver a activo desde bloqueo
        case "wake":
          uiRouter.navigate("watch", userProfile);
          break;

        // stack-close no tiene efecto visible en el reloj
        case "stack-close":
          break;
      }
    });

    // Bloqueo por botón en la UI del reloj
    socketManager.on("user:blocked", () => {
      returnToIdle();
    });

    // ═══════════════════════════════════════════════
    // MÓVIL — sensor y pantalla secundaria
    // ═══════════════════════════════════════════════
  } else {
    const mobileUI = new MobileUI(container);
    mobileUI.setUserProfile(userProfile);
    uiRouter.setInterface(mobileUI);
    socketManager.identifyDevice("home");

    // Arrancar en pantalla de sensor activo (el reloj es la pantalla principal)
    uiRouter.navigate("sensor");

    // Cambios de modo desde el servidor → actualizar pantalla del móvil
    socketManager.on("mode:change", ({ mode }) => {
      if (mode === "active") {
        uiRouter.navigate("sensor");
      } else if (mode === "sleep") {
        uiRouter.navigate("block-mode");
      }
      // "stack" lo gestiona missed_encounters_data
    });

    // Servidor envía la pila de personas (tras stack-open)
    socketManager.on("missed_encounters_data", (users) => {
      uiRouter.navigate("stack", users);
    });

    // Feedback de gestos en el móvil — solo animar si estamos viendo la pila
    socketManager.on("gesture:received", (data) => {
      const currentView =
        uiRouter.history[uiRouter.history.length - 1]?.viewType;
      if (currentView !== "stack") return;

      if (data.type === "accept" || data.type === "nav") {
        uiRouter.activeInterface.processGesture(data.type);
      }
    });

    // Inicializar captura de gestos del móvil
    initGestures();
  }
};