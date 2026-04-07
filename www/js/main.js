// www/js/main.js
import { WatchUI } from "./modules/ui/watchUI.js";
import { HomeUI } from "./modules/ui/homeUI.js";
import { socketManager } from "./core/socketManager.js";
import { uiRouter } from "./core/uiRouter.js";

// EXPONER PARA PRUEBAS (Solo para desarrollo)
// TODO: quitar esto
window.sm = socketManager;

const params = new URLSearchParams(window.location.search);
const userID = params.get("user");
const isWatch = params.get("v") === "watch";

if (!userID) {
  // Si no hay user, mostramos error y paramos la ejecución
  document.body.innerHTML =
    "<h1>Error: Debes indicar un ?user=ID en la URL</h1>";
  throw new Error("No userID provided");
}
socketManager.connect(userID);
const container = document.getElementById("app-container");
let currentUser = null;

// 1. Identificar dispositivo y renderizar
if (isWatch) {
  const userData = {
    name: "Laura",
    photo: "https://i.pravatar.cc/150",
    phone: "600111222",
  };

  const watchUI = new WatchUI(container);
  uiRouter.setInterface(watchUI);

  uiRouter.navigate("watch", userData);
  socketManager.identifyDevice("watch");
  console.log("Modo Reloj: Renderizado correctamente");

  // Esto es la logica de movimientos no creo que deba estar aqui
  socketManager.on("user:nearby", (userData) => {
    currentUser = userData;
    uiRouter.navigate("profile", currentUser);
  });

  // 2. Cuando llega un gesto desde el móvil
  socketManager.on("gesture:received", (data) => {
    if (!currentUser) return;

    if (data.type === "accept") {
      uiRouter.navigate("match", currentUser);

      setTimeout(() => {
        uiRouter.navigate("connection", currentUser);
      }, 5000);
    } else if (data.type === "reject") {
      uiRouter.navigate("watch");
      currentUser = null;
    }
  });
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
