// www/js/main.js
import { watchUI } from "./modules/ui/watchUI.js";
import { HomeUI } from "./modules/ui/homeUI.js";

const socket = io();
const params = new URLSearchParams(window.location.search);
const isWatch = params.get("v") === "watch";
const container = document.getElementById("app-container");

// 1. Identificar dispositivo y renderizar
if (isWatch) {
  const userData = {
    name: "Laura",
    photo: "https://www.loremfaces.net/128/id/1.jpg",
    phone: "600111222",
  };
  watchUI.render(container, userData);

  socket.emit("device:identify", "watch");
  console.log("Modo Reloj: Renderizado correctamente");
} else {
  // Inicializamos la interfaz del PC (Modo Casa)
  const homeUI = new HomeUI(container.id);
  homeUI.renderBase();

  // Solicitamos la lista de encuentros al conectar
  socket.emit("request_missed_encounters");

  socket.emit("device:identify", "home");
  console.log("Modo Home: Renderizado correctamente");

  // 2. Gestión de Sockets exclusivos para el Modo Home
  socket.on("missed_encounters_data", (users) => {
    homeUI.loadStack(users);
  });

  socket.on("gesture:received", (data) => {
    // Procesamos el gesto directamente en la interfaz de Home
    // Usamos data.type respetando la estructura de evento que tenías
    homeUI.processGesture(data.type);
  });
}

// 2. Gestión de Sockets
socket.on("gesture:received", (data) => {
  if (!isWatch) {
    const status = document.getElementById("last-gesture");
    if (status) status.innerText = `Gesto recibido: ${data.type}`;
  }
});
