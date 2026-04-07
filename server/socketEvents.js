module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Nuevo dispositivo conectado: ${socket.id}`);

    socket.on("device:identify", (deviceType) => {
      socket.join(deviceType);
      console.log(`[Socket] Dispositivo ${socket.id} se unió a: ${deviceType}`);
    });

    // --- NUEVO: Simular que alguien aparece (Para tus pruebas de consola) ---
    socket.on("user:nearby", (data) => {
      console.log(`[Simulación] Usuario cerca: ${data.name}`);
      // Lo enviamos a la sala 'watch' para que el reloj reaccione
      io.to("watch").emit("user:nearby", data);
    });

    // --- CORREGIDO: Escuchar gestos y enviarlos a AMBOS (Home y Watch) ---
    socket.on("gesture:sent", (data) => {
      console.log(`[Gesto] Recibido: ${data.gestureType}`);

      const payload = {
        type: data.gestureType,
        action: data.action,
        timestamp: new Date().getTime(),
      };

      // Enviamos al PC para que gestione la pila
      io.to("home").emit("gesture:received", payload);

      // TAMBIÉN enviamos al RELOJ para que cambie de pantalla (de Match a Profile)
      io.to("watch").emit("gesture:received", payload);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Dispositivo desconectado: ${socket.id}`);
    });
  });
};
