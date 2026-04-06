// www/js/main.js
import { watchUI } from "./modules/watchUI.js";

const socket = io();
const params = new URLSearchParams(window.location.search);
const isWatch = params.get("v") === "watch";
const container = document.getElementById("app-container");

// 1. Identificar dispositivo y renderizar
if (isWatch) {
  // Inyectamos la interfaz del reloj
  container.innerHTML = watchUI.render({
    photo: "../assets/icons/supernova.png",
    name: "Mamapolaca"
  });

  socket.emit("device:identify", "watch");
  console.log("Modo Reloj: Renderizado correctamente");
} else {
  // Interfaz básica para el PC hasta que tengas el homeUI.js
  container.innerHTML = `
        <div style="color:white; padding:20px;">
            <h1>Modo Casa (PC)</h1>
            <p id="last-gesture">Esperando gestos...</p>
        </div>
    `;

  socket.emit("device:identify", "home");
  console.log("Modo Home: Renderizado correctamente");
}

// 2. Gestión de Sockets
socket.on("gesture:received", (data) => {
  if (!isWatch) {
    const status = document.getElementById("last-gesture");
    if (status) status.innerText = `Gesto recibido: ${data.type}`;
  }
});
