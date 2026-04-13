const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const socketEvents = require("./socketEvents"); // Importamos la lógica de sockets

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 1. Configuración de carpetas estáticas
// Usamos path.join para evitar errores de rutas entre Windows/Mac
const publicPath = path.join(__dirname, "../www");
app.use(express.static(publicPath));

// 2. Ruta principal (Sirve el index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// 3. Inicializar los eventos de Socket.io pasándole la instancia 'io'
socketEvents(io);

// 4. Arrancar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`Servidor corriendo en:`);
  console.log(`Movil:\nhttp://localhost:${PORT}/?user=101&v=home`);
  console.log(
    `Reloj:\nhttp://localhost:${PORT}/?user=101&v=watch\n-> en chrome://inspect con Port Forwarding`,
  );
  console.log(`==========================================`);
});
