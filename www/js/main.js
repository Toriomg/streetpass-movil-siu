// www/js/main.js
import { WatchUI } from "./modules/ui/watchUI.js";
import { HomeUI } from "./modules/ui/homeUI.js";
import { socketManager } from "./core/socketManager.js";
import { uiRouter } from "./core/uiRouter.js";

// EXPONER PARA PRUEBAS (Solo para desarrollo)
// TODO: quitar esto
window.sm = socketManager;

const params = new URLSearchParams(window.location.search);
const isWatch = params.get("v") === "watch";
const container = document.getElementById("app-container");
let currentUser = null;

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

  socketManager.on("user:nearby", (userData) => {
    currentUser = userData; // Guardamos los datos (nombre, foto, etc.)
    uiRouter.navigate("match", currentUser);
  });

  // 2. Cuando llega un gesto desde el móvil
  socketManager.on("gesture:received", (data) => {
    if (!currentUser) return;

    if (data.type === "accept") {
      // Si aceptamos, vamos a ver su perfil o conexión directamente
      uiRouter.navigate("profile", currentUser);

      // Opcional: A los 3 segundos pasar a la pantalla de conexión (teléfono)
      setTimeout(() => {
        uiRouter.navigate("connection", currentUser);
      }, 5000);
    } else if (data.type === "reject") {
      // Si rechazamos, volvemos a la pantalla del reloj principal
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
