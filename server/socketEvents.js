module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Nuevo dispositivo conectado: ${socket.id}`);

    // Escuchar cuando un dispositivo dice quién es (Reloj o PC)
    socket.on("device:identify", (deviceType) => {
      socket.join(deviceType); // Se une a la sala 'watch' o 'home'
      console.log(
        `[Socket] Dispositivo ${socket.id} se unió a la sala: ${deviceType}`,
      );
    });

    // Escuchar gestos enviados desde el Reloj (Móvil)
    socket.on("gesture:sent", (data) => {
      console.log(`[Gesto] Recibido de reloj: ${data.gestureType}`);

      // Reenviar el gesto a todos los que estén en la sala 'home' (el PC)
      // .to('home') asegura que solo el PC reciba el comando
      io.to("home").emit("gesture:received", {
        type: data.gestureType,
        action: data.action,
        timestamp: new Date().getTime(),
      });
    });

    // Escuchar eventos desde el PC (por ejemplo, al aceptar a alguien en modo casa)
    socket.on("home:action", (data) => {
      console.log(`[Acción Home] Enviar a reloj: ${data.message}`);
      io.to("watch").emit("watch:notification", data);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Dispositivo desconectado: ${socket.id}`);
    });
  });
};
