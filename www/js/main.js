// www/js/main.js
import { WatchUI } from "./modules/ui/watchUI.js";
import { HomeUI } from "./modules/ui/homeUI.js";
import { socketManager } from "./core/socketManager.js";

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

  const watchUI = new WatchUI(container);
  watchUI.render(userData);

  socketManager.identifyDevice("watch");
  console.log("Modo Reloj: Renderizado correctamente");
} else {
  const homeUI = new HomeUI(container.id);
  homeUI.renderBase();

  socketManager.emit("request_missed_encounters");
  socketManager.identifyDevice("home");
  console.log("Modo Home: Renderizado correctamente");

  // 2. Gestión de Sockets exclusivos para el Modo Home
  socketManager.on("missed_encounters_data", (users) => {
    homeUI.loadStack(users);
  });

  socketManager.on("gesture:received", (data) => {
    homeUI.processGesture(data.type);
  });
}