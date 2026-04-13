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

  // El reloj pide bloquear gestos (e.g. tras saltar match/connection)
  socketManager.on("gesture:lock", ({ ms } = {}) => {
    externalCooldownUntil = Date.now() + (ms || 1500);
    console.log(`[Gestures] Lock externo: ${ms || 1500}ms`);
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
    // TOQUES:
    //   • 1 toque  → ampliar rango (shake)
    //   • 2 toques → modo bloqueo (sleep)
    //   • 3 toques → cerrar app (exit)
    // Los toques ignoran el cooldown siempre
    // ─────────────────────────────────────────────
    let tapCount = 0;
    let tapTimer = null;
    document.addEventListener("touchstart", () => {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        const count = tapCount;
        tapCount = 0;
        if (count === 1)      sendGesture("AMPLIAR RANGO 📡", "shake");
        else if (count === 2) {
          if (currentMode === "sleep") sendGesture("VER PERSONAS 📋", "stack-open");
          else sendGesture("MODO BLOQUEO 🌙", "sleep");
        }
        else if (count >= 3)  sendGesture("CERRAR ✖", "exit");
        activateCooldown(800);
      }, 350);
    });

    // ─────────────────────────────────────────────
    // INCLINACIÓN (deviceorientation)
    //   • Inclinar derecha (gamma > 55) → nav (pasar)
    //   • Inclinar izquierda (gamma < -55) → accept (conectar)
    // ─────────────────────────────────────────────
    let tiltActive = false;
    let pendingTilt = null; // { type, timer }

    // Detección de shake por conteo de picos
    let shakePeaks = 0;
    let shakeWindowStart = 0;
    const SHAKE_PEAK_THRESHOLD = 22;
    const SHAKE_PEAKS_NEEDED = 3;
    const SHAKE_WINDOW_MS = 600;

    window.addEventListener("deviceorientation", (event) => {
      if (currentMode === "sleep") return;
      const { gamma, beta } = event;
      console.log(`[Orientation] beta=${beta?.toFixed(1)} gamma=${gamma?.toFixed(1)} cooldown=${isCooldown} tiltActive=${tiltActive} mode=${currentMode}`);
      if (gamma === null || beta === null) return;

      const isTilted = Math.abs(gamma) > 55;

      if (!isTilted) {
        tiltActive = false;
        return;
      }

      if (isCooldown || tiltActive || Date.now() < externalCooldownUntil) return;

      // Si ya se ha confirmado un shake (≥2 picos), no lanzar tilt
      if (shakePeaks >= 2 && Date.now() - shakeWindowStart < SHAKE_WINDOW_MS) return;

      tiltActive = true;
      const tiltType = gamma > 55 ? "nav" : "accept";

      // Esperar 350ms antes de enviar — el shake puede cancelarlo si llega antes
      pendingTilt = { type: tiltType };
      pendingTilt.timer = setTimeout(() => {
        if (!pendingTilt) return;
        pendingTilt = null;
        if (tiltType === "accept" && "vibrate" in navigator) navigator.vibrate([80, 60, 80]);
        sendGesture(tiltType === "nav" ? "DERECHA →" : "IZQUIERDA ←", tiltType);
      }, 350);
      activateCooldown(400);
    });

    // ─────────────────────────────────────────────
    // MOVIMIENTO (devicemotion)
    //   • Agitar → block (bloquear usuario)
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
      console.log(`[Motion] ay=${ay.toFixed(1)} total=${totalAcc.toFixed(1)} peaks=${shakePeaks} cooldown=${isCooldown} mode=${currentMode}`);

      // En modo bloqueo solo se procesa el gesto de brazo (stack-open / wake)
      if (currentMode === "sleep") {
        if (isCooldown) return;
        const now = Date.now();
        if (ay < -12) {
          if (!armGesture || armGesture.type !== "up") {
            armGesture = { type: "up", startTime: now, peakAcc: ay };
          } else {
            armGesture.peakAcc = Math.min(armGesture.peakAcc, ay);
            if (now - armGesture.startTime > 800) {
              const isSharpPull = armGesture.peakAcc < -20;
              const isSoftRaise  = armGesture.peakAcc < -14; // wake requiere mínimo -14
              if (isSharpPull) {
                sendGesture("VER PERSONAS", "stack-open");
                armGesture = null;
                activateCooldown(2500);
              } else if (isSoftRaise) {
                sendGesture("MODO ACTIVO", "wake");
                armGesture = null;
                activateCooldown(2500);
              }
              // Si no alcanza el umbral mínimo, no hace nada (movimiento accidental)
            }
          }
        } else {
          if (armGesture && now - armGesture.startTime > 200) armGesture = null;
        }
        return;
      }

      // Contar picos de aceleración para detectar shake real
      if (totalAcc > SHAKE_PEAK_THRESHOLD) {
        const now = Date.now();
        if (now - shakeWindowStart > SHAKE_WINDOW_MS) {
          shakePeaks = 0;
          shakeWindowStart = now;
        }
        shakePeaks++;

        if (shakePeaks >= SHAKE_PEAKS_NEEDED && !isCooldown) {
          shakePeaks = 0;
          if (pendingTilt) { clearTimeout(pendingTilt.timer); pendingTilt = null; }
          armGesture = null;
          sendGesture("BLOQUEAR ⛔", "block");
          activateCooldown(2000);
          return;
        }
      } else {
        // Fuera de pico — resetear ventana si ha pasado suficiente tiempo
        if (Date.now() - shakeWindowStart > SHAKE_WINDOW_MS) shakePeaks = 0;
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