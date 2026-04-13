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

// Estados locales del reloj: "idle" | "profile" | "animating" | "match" | "connection" | "closed"
let watchState = "idle";

function setWatchState(s) {
  watchState = s;
  console.log(`[Watch] estado → ${s} (cola: ${nearbyQueue.length})`);
}

function returnToIdle() {
  // No salir de sleeping ni closed desde aquí — esos estados tienen su propia lógica
  if (watchState === "sleeping" || watchState === "closed") return;
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

  // OPTIONAL: Auto-skip after 10 seconds if no gesture is made
  setTimeout(() => {
    if (watchState === "profile" && currentUser?.id === userData.id) {
      console.log("Auto-skipping user due to inactivity");
      returnToIdle();
    }
  }, 10000);
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

    // Botón auto-trigger manual (desactivado por defecto, solo para pruebas)
    let autoInterval = null;
    const startAuto = () =>
      setInterval(() => socketManager.emit("user:nearby:trigger"), 10000);
    const autoBtn = document.createElement("button");
    autoBtn.textContent = "Auto OFF";
    autoBtn.style.marginLeft = "8px";
    autoBtn.addEventListener("click", () => {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        autoBtn.textContent = "Auto OFF";
      } else {
        autoInterval = startAuto();
        autoBtn.textContent = "Auto ON (10s)";
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
      console.log(
        `[Watch] ✅ user:nearby recibido: ${userData?.name} | estado: ${watchState}`,
      );
      if (watchState === "closed" || watchState === "sleeping") {
        console.log(`[Watch] user:nearby ignorado — estado: ${watchState}`);
        return;
      }
      if (watchState === "idle" || !currentUser) {
        showNearbyUser(userData);
      } else {
        nearbyQueue.push(userData);
        nearbyQueue.sort((a, b) => (a.distancia ?? 999) - (b.distancia ?? 999));
        console.log(
          `[Watch] user:nearby encolado (cola: ${nearbyQueue.length})`,
        );
      }
    });

    // Precargar 3 personas al inicio — DESPUÉS de registrar el handler
    console.log("[Watch] 🚀 Precargando 3 personas iniciales...");
    for (let i = 0; i < 3; i++) socketManager.emit("user:nearby:trigger");

    // Añade este nuevo intervalo justo debajo
    console.log("[Watch] ⏱️ Iniciando generador automático (1 cada 5s)");
    setInterval(() => {
      // En modo cerrado no pedimos personas; en modo bloqueo sí (para el móvil)
      if (watchState !== "closed") {
        socketManager.emit("user:nearby:trigger");
      }
    }, 5000);

    // El reloj reacciona a todos los gestos
    let acceptTimers = []; // timers de match/connection — se pueden cancelar con gesto

    const skipToNext = () => {
      acceptTimers.forEach(clearTimeout);
      acceptTimers = [];
      socketManager.emit("gesture:lock", { ms: 1500 }); // decirle al móvil que bloquee gestos
      returnToIdle();
    };

    socketManager.on("gesture:received", (data) => {
      switch (data.type) {
        case "accept": {
          // Durante match/connection: saltar a la siguiente persona
          if (watchState === "match" || watchState === "connection") {
            skipToNext();
            break;
          }
          if (watchState !== "profile" || !currentUser) break;
          const accepted = currentUser; // capturar valor, no referencia
          setWatchState("animating");
          watchUI.showSwipeIndicator("accept", () => {
            setWatchState("match");
            uiRouter.navigate("match", accepted);
            const t1 = setTimeout(() => {
              setWatchState("connection");
              uiRouter.navigate("connection", {
                ...accepted,
                userPhoto: userProfile?.photo,
              });
              const t2 = setTimeout(() => skipToNext(), 5000);
              acceptTimers = [t2];
            }, 5000);
            acceptTimers = [t1];
          });
          // Seguridad: si el callback no se dispara, salir de "animating" igualmente
          setTimeout(() => {
            if (watchState === "animating") returnToIdle();
          }, 900);
          break;
        }

        // Pasar persona → el servidor ya manda la siguiente vía user:nearby
        case "nav": {
          // Durante match/connection: saltar a la siguiente persona
          if (watchState === "match" || watchState === "connection") {
            skipToNext();
            break;
          }
          if (watchState !== "profile" || !currentUser) break;
          setWatchState("animating");
          watchUI.showSwipeIndicator("reject", () => {
            lockGestures(800);
            returnToIdle();
          });
          // Seguridad: si el callback no se dispara, salir de "animating" igualmente
          setTimeout(() => {
            if (watchState === "animating") returnToIdle();
          }, 900);
          break;
        }

        // Bloquear usuario por gesto — mostrar confirmación breve
        case "block":
          if (watchState !== "profile") break;
          uiRouter.navigate("message", { message: "Usuario bloqueado ⛔" });
          setTimeout(() => returnToIdle(), 2000);
          break;

        // Cerrar / reabrir app (toggle)
        case "exit":
          if (watchState === "closed") {
            setWatchState("idle");
            uiRouter.navigate("watch", userProfile);
          } else {
            closeApp();
          }
          break;

        // Ampliar rango → añade 10 personas a la cola + indicador visual
        case "shake": {
          for (let i = 0; i < 10; i++)
            socketManager.emit("user:nearby:trigger");
          const backView = currentUser ? "profile" : "watch";
          const backData = currentUser ? currentUser : userProfile;
          uiRouter.navigate("message", {
            icon: "📡",
            iconClass: "icon-pulse",
            message: `Rango ampliado`,
          });
          setTimeout(() => uiRouter.navigate(backView, backData), 2000);
          break;
        }

        // Modo bloqueo activado — pantalla persistente en el reloj
        case "sleep":
          currentUser = null;
          nearbyQueue = [];
          setWatchState("sleeping");
          uiRouter.navigate("sleep");
          break;

        // Volver a activo desde bloqueo sin ver personas (gesto suave de brazo)
        case "wake":
          setWatchState("idle");
          uiRouter.navigate("watch", userProfile);
          break;

        // Pila revisada — volver a activo en el reloj
        case "stack-close":
          setWatchState("idle");
          uiRouter.navigate("watch", userProfile);
          break;
      }
    });

    // Bloqueo por botón en la UI del reloj
    socketManager.on("user:blocked", () => {
      uiRouter.navigate("message", { message: "Usuario bloqueado ⛔" });
      setTimeout(() => returnToIdle(), 2000);
    });

    // No hay más personas nuevas — mostrar mensaje breve y quedarse en idle
    socketManager.on("user:nearby:empty", () => {
      if (watchState !== "idle") return;
      uiRouter.navigate("message", { message: "No hay nadie más cerca" });
      setTimeout(() => uiRouter.navigate("watch", userProfile), 3000);
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

    let mobileAppClosed = false;

    // Cambios de modo desde el servidor → actualizar pantalla del móvil
    socketManager.on("mode:change", ({ mode }) => {
      if (mobileAppClosed) return; // app cerrada — ignorar cambios de modo
      if (mode === "active") {
        uiRouter.navigate("sensor");
      } else if (mode === "sleep") {
        uiRouter.navigate("block-mode");
      }
      // "stack" lo gestiona missed_encounters_data
    });

    // Persona añadida a la cola mientras el reloj está en modo bloqueo → mostrar en tiempo real
    socketManager.on("user:queued", (user) => {
      if (mobileAppClosed) return;
      const currentView = uiRouter.history[uiRouter.history.length - 1]?.viewType;
      console.log(`[Mobile] user:queued → ${user.name} | vista actual: ${currentView}`);
      if (currentView === "sleep-list") {
        mobileUI.pushUser(user);
      } else {
        uiRouter.navigate("sleep-list", [user]);
      }
    });

    // Servidor envía la pila completa (tras wake o stack-open)
    socketManager.on("missed_encounters_data", (users) => {
      if (mobileAppClosed) return;
      const currentView = uiRouter.history[uiRouter.history.length - 1]?.viewType;
      if (currentView === "sleep-list") {
        // Ya estamos mostrando la lista — solo añadir los que no estén ya en la pila
        const existingIds = new Set(mobileUI.pendingStack.map(u => u.id));
        users.filter(u => !existingIds.has(u.id)).forEach(u => mobileUI.pushUser(u));
      } else {
        uiRouter.navigate("sleep-list", users);
      }
    });

    // Gestos en el móvil
    socketManager.on("gesture:received", (data) => {
      if (data.type === "exit") {
        mobileAppClosed = !mobileAppClosed;
        uiRouter.navigate(mobileAppClosed ? "app-closed" : "sensor");
        return;
      }

      const currentView =
        uiRouter.history[uiRouter.history.length - 1]?.viewType;
      if (currentView !== "stack" && currentView !== "sleep-list") return;
      if (data.type === "accept" || data.type === "nav") {
        uiRouter.activeInterface.processGesture(data.type);
      }
    });

    // Inicializar captura de gestos del móvil
    initGestures();
  }
};
