const socket = io();

const pcDiv = document.getElementById("vista-pc");
const movilDiv = document.getElementById("vista-movil");

// 1. Detectar si es móvil o PC
// Miramos si la pantalla es pequeña o si el sistema es móvil
const esMovil =
  /Android|iPhone/i.test(navigator.userAgent) || window.innerWidth < 800;

if (esMovil) {
  // Lógica para el móvil
  movilDiv.classList.remove("oculto");

  document.getElementById("boton-accion").addEventListener("click", () => {
    socket.emit("mensaje-al-servidor", { texto: "Botón pulsado en el móvil" });
  });
} else {
  // Lógica para el PC
  pcDiv.classList.remove("oculto");

  socket.on("mensaje-desde-servidor", (datos) => {
    document.getElementById("pantalla-datos").innerText = datos.texto;
    document.body.style.backgroundColor = "lightgreen";
  });
}
