// www/js/main.js
const socket = io();
const params = new URLSearchParams(window.location.search);
const isWatch = params.get("v") === "watch";

// Ocultar pantalla de carga y mostrar la vista correcta
document.getElementById("view-error").classList.add("hidden");

if (isWatch) {
  document.getElementById("view-watch").classList.remove("hidden");
  socket.emit("device:identify", "watch");
  console.log("Iniciado como Reloj");
} else {
  document.getElementById("view-home").classList.remove("hidden");
  socket.emit("device:identify", "home");
  console.log("Iniciado como Home/PC");
}

// Ejemplo de recepción de mensaje
socket.on("gesture:received", (data) => {
  if (!isWatch) {
    document.getElementById("last-gesture").innerText = `Gesto: ${data.type}`;
  }
});
