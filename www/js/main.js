// www/js/main.js
import { WatchUI } from "./modules/ui/watchUI.js";
import { HomeUI } from "./modules/ui/homeUI.js";
import { socketManager } from "./core/socketManager.js";
import { uiRouter } from "./core/uiRouter.js";

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
  uiRouter.setInterface(watchUI);
  
  uiRouter.navigate("watch", userData);

  socketManager.identifyDevice("watch");
  console.log("Modo Reloj: Renderizado correctamente");
} else {
  const homeUI = new HomeUI(container.id);
  uiRouter.setInterface(homeUI);
  uiRouter.navigate("pila");

  socketManager.emit("request_missed_encounters");
  socketManager.identifyDevice("home");
  console.log("Modo Home: Renderizado correctamente");
}

socketManager.on("missed_encounters_data", (users) => {
  // El Router se encarga de actualizar la vista de la pila
  uiRouter.navigate("pila", users);
});


socketManager.on("gesture:received", (data) => {
  // Si estamos en casa, el Router le pasa el gesto a HomeUI
  // (HomeUI debe tener lógica para procesar gestos dentro de su render o similar)
  if (!isWatch) {
    // Aquí podrías llamar a un método de homeInterface directamente
    // o hacer que el router gestione el cambio de carta
    uiRouter.activeInterface.processGesture(data.type);
  }
});