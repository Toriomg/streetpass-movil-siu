import { GestureManager } from "./modules/gestures.js";
import { WatchUI } from "./modules/watchUI.js";
import { HomeUI } from "./modules/homeUI.js";

const params = new URLSearchParams(window.location.search);
const isWatch = params.get("v") === "watch";

if (isWatch) {
  const ui = new WatchUI();
  ui.render();

  // Solo el reloj captura gestos
  new GestureManager((gesture) => {
    console.log("Gesto capturado:", gesture);
    socket.emit("new-gesture", gesture);
    ui.update(gesture);
  });
} else {
  const ui = new HomeUI();
  ui.render();
}
