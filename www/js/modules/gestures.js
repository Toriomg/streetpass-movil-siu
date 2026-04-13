import { socketManager } from "../core/socketManager.js";

// Estado actual del sistema, sincronizado con el servidor
let currentMode = "active"; // "active" | "sleep" | "stack"

let externalCooldownUntil = 0;

export function lockGestures(ms) {
  externalCooldownUntil = Date.now() + ms;
}

export function initGestures() {
  const btn = document.getElementById("start-sensors");

  // Mantener el modo local sincronizado con el servidor
  socketManager.on("mode:change", ({ mode }) => {
    currentMode = mode;
    console.log(`[Gestures] Modo actualizado a: ${mode}`);
  });

  const needsIOSPermission =
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function";

  if (needsIOSPermission) {
    // iOS: el permiso solo se puede pedir desde un gesto del usuario
    btn.style.display = "";
    btn.onclick = () => {
      DeviceOrientationEvent.requestPermission().then((state) => {
        if (state === "granted") startListening();
      });
      btn.style.display = "none";
    };
  } else {
    // Android / otros: arrancar directamente sin interacción
    startListening();
  }

  function startListening() {
    console.log("[Gestures] Escuchando gestos...");

    let isCooldown = false;

    // ─────────────────────────────────────────────
    // DOBLE TOQUE → exit (cierre, cualquier estado)
    // ─────────────────────────────────────────────
    let lastTapTime = 0;
    document.addEventListener("touchstart", () => {
      // El doble toque ignora el cooldown — exit funciona siempre
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
    //   • Inclinar derecha (gamma > 55) → nav (pasar)
    //   • Inclinar izquierda (gamma < -55) → accept (conectar)
    //   • Inclinar hacia arriba (beta < 45) → block (bloquear usuario)
    // ─────────────────────────────────────────────
    let tiltActive = false; // true mientras el móvil sigue en posición de gesto

    window.addEventListener("deviceorientation", (event) => {
      const { gamma, beta } = event;
      console.log(`[Orientation] beta=${beta?.toFixed(1)} gamma=${gamma?.toFixed(1)} cooldown=${isCooldown} tiltActive=${tiltActive} mode=${currentMode}`);
      if (gamma === null || beta === null) return;

      const isGammaTilted = Math.abs(gamma) > 55;  // inclinación izq / der
      const isBetaUp      = beta < 45;             // pantalla mirando al techo (bloquear)
      const isAnyTilted   = isGammaTilted || isBetaUp;

      // Volver a posición neutral → permitir el siguiente gesto
      if (!isAnyTilted) {
        tiltActive = false;
        return;
      }

      if (isCooldown || tiltActive || Date.now() < externalCooldownUntil) return;

      tiltActive = true;

      // BLOQUEAR tiene prioridad: pantalla al techo y sin inclinación lateral fuerte
      if (isBetaUp && !isGammaTilted) {
        sendGesture("ARRIBA ↑ BLOQUEAR", "block");
        activateCooldown(1000);
      } else if (gamma > 55) {
        sendGesture("DERECHA →", "nav");
        activateCooldown(300);
      } else {
        // gamma < -55 → aceptar / conectar
        if ("vibrate" in navigator) navigator.vibrate([80, 60, 80]);
        sendGesture("IZQUIERDA ←", "accept");
        activateCooldown(300);
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
      console.log(`[Motion] ay=${ay.toFixed(1)} total=${totalAcc.toFixed(1)} cooldown=${isCooldown} mode=${currentMode}`);

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

          if (elapsed > 550 && currentMode === "sleep") {
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