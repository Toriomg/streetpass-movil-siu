import { socketManager } from "../core/socketManager.js";

// Estado actual del sistema, sincronizado con el servidor
let currentMode = "active"; // "active" | "sleep" | "stack"

export function initGestures() {
  const btn = document.getElementById("start-sensors");

  // Mantener el modo local sincronizado con el servidor
  socketManager.on("mode:change", ({ mode }) => {
    currentMode = mode;
    console.log(`[Gestures] Modo actualizado a: ${mode}`);
  });

  btn.onclick = () => {
    // iOS requiere permiso explícito para los sensores
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission().then((state) => {
        if (state === "granted") startListening();
      });
    } else {
      startListening();
    }
    btn.style.display = "none";
  };

  function startListening() {
    console.log("[Gestures] Escuchando gestos...");

    let isCooldown = false;

    // ─────────────────────────────────────────────
    // DOBLE TOQUE → exit (cierre, cualquier estado)
    // ─────────────────────────────────────────────
    let lastTapTime = 0;
    document.addEventListener("touchstart", () => {
      if (isCooldown) return;
      const now = Date.now();
      const delta = now - lastTapTime;
      if (delta < 300 && delta > 0) {
        lastTapTime = 0;
        sendGesture("CERRAR ✖", "exit");
        activateCooldown(1000);
      } else {
        lastTapTime = now;
      }
    });

    // ─────────────────────────────────────────────
    // INCLINACIÓN (deviceorientation)
    //   • Inclinar derecha (gamma > 35) → nav (pasar)
    //   • Inclinar izquierda (gamma < -35) → accept (conectar)
    //   • Inclinar hacia arriba (beta < 45) → block (bloquear usuario)
    // ─────────────────────────────────────────────
    window.addEventListener("deviceorientation", (event) => {
      if (isCooldown) return;
      const { gamma, beta } = event;
      if (gamma === null || beta === null) return;

      // Prioridad 1: bloquear (beta bajo = pantalla apunta al techo)
      // Solo en modo activo o stack (no cuando está en el bolsillo durmiendo)
      if (
        beta < 45 &&
        Math.abs(gamma) < 25 &&
        (currentMode === "active" || currentMode === "stack")
      ) {
        sendGesture("BLOQUEAR ⛔", "block");
        activateCooldown(1500);
        return;
      }

      // Prioridad 2: inclinación derecha / izquierda
      if (gamma > 35) {
        sendGesture("DERECHA →", "nav");
        activateCooldown(500);
      } else if (gamma < -35) {
        sendGesture("IZQUIERDA", "accept");
        activateCooldown(500);
      }
    });

    // ─────────────────────────────────────────────
    // MOVIMIENTO (devicemotion)
    //   • Agitar → shake (ampliar rango)
    //   • Bajar brazo → sleep (modo bloqueo) [solo en activo]
    //   • Subir brazo suave → wake (volver a activo) [solo en sleep]
    //   • Subir brazo fuerte/brusco → stack-open [solo en sleep]
    //   • Bajar brazo → stack-close [solo en stack]
    // ─────────────────────────────────────────────

    // Rastreo del movimiento del brazo para distinguir gestos sostenidos
    let armGesture = null; // { type: 'up'|'down', startTime, peakAcc }

    window.addEventListener("devicemotion", (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const ay = acc.y ?? 0;
      const totalAcc = Math.sqrt(
        (acc.x ?? 0) ** 2 + ay ** 2 + (acc.z ?? 0) ** 2,
      );

      // AGITAR — prioridad máxima (umbral alto, cooldown largo)
      if (totalAcc > 30 && !isCooldown) {
        armGesture = null;
        sendGesture("AMPLIAR RANGO 📡", "shake");
        activateCooldown(2000);
        return;
      }

      if (isCooldown) return;

      const now = Date.now();

      if (ay < -9) {
        // ── Brazo subiendo ──
        if (!armGesture || armGesture.type !== "up") {
          armGesture = { type: "up", startTime: now, peakAcc: ay };
        } else {
          armGesture.peakAcc = Math.min(armGesture.peakAcc, ay);
          const elapsed = now - armGesture.startTime;

          if (elapsed > 350 && currentMode === "sleep") {
            const isSharpPull = armGesture.peakAcc < -20;
            if (isSharpPull) {
              sendGesture("VER PERSONAS", "stack-open");
            } else {
              sendGesture("MODO ACTIVO", "wake");
            }
            armGesture = null;
            activateCooldown(2500);
          }
        }
      } else if (ay > 9) {
        // ── Brazo bajando ──
        if (!armGesture || armGesture.type !== "down") {
          armGesture = { type: "down", startTime: now, peakAcc: ay };
        } else {
          armGesture.peakAcc = Math.max(armGesture.peakAcc, ay);
          const elapsed = now - armGesture.startTime;

          if (elapsed > 400) {
            if (currentMode === "active") {
              sendGesture("MODO BLOQUEO", "sleep");
              armGesture = null;
              activateCooldown(3000);
            } else if (currentMode === "stack") {
              sendGesture("VOLVER", "stack-close");
              armGesture = null;
              activateCooldown(2000);
            }
          }
        }
      } else {
        // Zona neutral — resetear rastreo suavemente
        if (armGesture && now - armGesture.startTime > 200) {
          armGesture = null;
        }
      }
    });

    // ─────────────────────────────────────────────
    function activateCooldown(ms) {
      isCooldown = true;
      setTimeout(() => (isCooldown = false), ms);
    }
  }

  // ─────────────────────────────────────────────
  // Muestra el gesto en pantalla y lo envía al servidor
  // ─────────────────────────────────────────────
  let displayTimeout;
  function sendGesture(label, gestureType) {
    const display = document.getElementById("data-display");
    if (display) {
      display.innerText = label;
      display.style.opacity = "1";
    }
    console.log(`[Gestures] ${label} → gesture:sent { gestureType: "${gestureType}" }`);
    socketManager.emit("gesture:sent", { gestureType });

    clearTimeout(displayTimeout);
    displayTimeout = setTimeout(() => {
      if (display) {
        display.innerText = "Esperando gesto...";
        display.style.opacity = "0.5";
      }
    }, 1000);
  }
}