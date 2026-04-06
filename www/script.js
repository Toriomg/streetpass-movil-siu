const socket = io();
const params = new URLSearchParams(window.location.search);
const modo = params.get("v"); // 'reloj' o 'pc'

// 1. Mostrar interfaz según el modo
if (modo === "reloj") {
  document.getElementById("reloj-ui").classList.remove("hidden");
  activarSensores();
} else {
  document.getElementById("pc-ui").classList.remove("hidden");
}

// 2. CAPTURA DE GESTOS (Acelerómetro)
function activarSensores() {
  let lastX, lastY, lastZ;
  let moviendo = false;

  window.addEventListener("devicemotion", (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc.x) return;

    // Detección de Agitar (Sacudida fuerte)
    const fuerza = Math.abs(acc.x + acc.y + acc.z - (lastX + lastY + lastZ));
    if (fuerza > 30) {
      socket.emit("gesto-accion", { tipo: "AGITAR", accion: "silencio" });
    }

    // Detección de Inclinación (Izquierda / Derecha)
    if (acc.x > 5) {
      // Inclinado a la izquierda
      socket.emit("gesto-accion", { tipo: "IZQUIERDA", accion: "aceptar" });
    } else if (acc.x < -5) {
      // Inclinado a la derecha
      socket.emit("gesto-accion", { tipo: "DERECHA", accion: "rechazar" });
    }

    lastX = acc.x;
    lastY = acc.y;
    lastZ = acc.z;
  });

  // Toque simple (Aceptar según tu ruta.md)
  window.addEventListener("touchstart", () => {
    socket.emit("gesto-accion", { tipo: "TAP", accion: "aceptar" });
  });
}

// 3. RECIBIR ACCIONES (Lo que el reloj muestra cuando llega un gesto)
socket.on("ejecutar-accion", (data) => {
  const info = document.getElementById("notificacion");
  info.innerText = `Gesto: ${data.tipo} -> ${data.accion}`;

  // Feedback visual en el reloj
  const face = document.querySelector(".watch-face");
  if (data.accion === "aceptar") face.classList.add("aviso-aceptar");
  if (data.accion === "rechazar") face.classList.add("aviso-rechazar");

  setTimeout(() => {
    face.classList.remove("aviso-aceptar", "aviso-rechazar");
  }, 1000);
});
