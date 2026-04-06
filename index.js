const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// LA CLAVE: Aquí le decimos a Node que la carpeta 'www' es pública
app.use(express.static(path.join(__dirname, "www")));

// Si alguien entra a la raíz, le mandamos el index.html de www
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "www", "index.html"));
});

io.on("connection", (socket) => {
  console.log("Dispositivo conectado");

  // Escuchar mensajes de un dispositivo y mandarlos al otro
  socket.on("mensaje-al-servidor", (datos) => {
    io.emit("mensaje-desde-servidor", datos);
  });
});

server.listen(3000, () => {
  console.log("Servidor listo en http://localhost:3000");
});
