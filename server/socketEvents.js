// server/socketEvents.js

module.exports = function (io) {
  io.on("connection", (socket) => {
    // 1. Extraer el ID del usuario del handshake
    const userID = socket.handshake.auth.token;

    if (!userID) {
      console.log("[Socket] Conexión rechazada: No hay userID");
      return socket.disconnect();
    }

    // 2. El dispositivo se une a su sala privada de usuario
    socket.join(userID);
    console.log(
      `[Socket] Dispositivo ${socket.id} autenticado como: ${userID}`,
    );

    // 3. También se une a su sala de tipo (watch o home) para segmentar
    socket.on("device:identify", (deviceType) => {
      socket.join(`${userID}:${deviceType}`); // Ej: 'laura:watch'
      console.log(`[Socket] ${userID} conectado en modo: ${deviceType}`);
    });

    // 4. Al enviar un gesto, solo lo mandamos a LA SALA de ese usuario
    socket.on("gesture:sent", (data) => {
      console.log(`[Gesto] De ${userID}: ${data.gestureType}`);

      // Enviamos SOLO a los dispositivos que estén en la sala de ese userID
      io.to(userID).emit("gesture:received", {
        type: data.gestureType,
        timestamp: Date.now(),
      });
    });

    socket.on("user:nearby", (data) => {
      // Enviamos la notificación de usuario cerca solo al dueño de este socket
      io.to(userID).emit("user:nearby", data);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] ${userID} desconectado`);
    });
  });
};
