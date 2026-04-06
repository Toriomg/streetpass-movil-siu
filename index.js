const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static("www"));

io.on("connection", (socket) => {
  console.log("Dispositivo conectado:", socket.id);

  // Reenviar gestos del móvil al "reloj" (o viceversa)
  socket.on("gesto-accion", (data) => {
    console.log("Gesto recibido:", data.tipo);
    socket.broadcast.emit("ejecutar-accion", data);
  });
});

http.listen(3000, () => {
  console.log("Servidor UC3M en http://localhost:3000");
});
