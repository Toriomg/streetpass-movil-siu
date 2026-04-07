// www/js/main.js
import { WatchUI } from "./modules/ui/watchUI.js";
import { MobileUI } from "./modules/ui/mobileUI.js";
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
const userData = {
  name: "Laura",
  photo: "https://i.pravatar.cc/150",
  phone: "600111222",
};
if (isWatch) {
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
  const mobileUI = new MobileUI(container); // Pasamos el elemento, no solo el ID
  uiRouter.setInterface(mobileUI);

  // 1. Mostramos pantalla de Inicio (Face ID)
  uiRouter.navigate("start");

  // 2. Pedimos los datos al servidor
  socketManager.identifyDevice("home");
  socketManager.emit("request_missed_encounters");

  // 3. Cuando lleguen los datos, saltamos de "Face ID" a la "Pila"
  socketManager.on("missed_encounters_data", (users) => {
    console.log("Datos recibidos para la pila:", users);
    uiRouter.navigate("stack", users);
  });

  // 4. Escuchar gestos para mover la pila en el móvil
  socketManager.on("gesture:received", (data) => {
    // Si el router tiene cargada la MobileUI, procesamos el gesto
    if (uiRouter.activeInterface && uiRouter.activeInterface.processGesture) {
      uiRouter.activeInterface.processGesture(data.type);
    }
  });
}
