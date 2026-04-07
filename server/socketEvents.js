const dataManager = require("./dataManager");

module.exports = function (io) {
  io.on("connection", (socket) => {
    const userID = socket.handshake.auth.token;
    if (!userID) return socket.disconnect();

    socket.join(userID);

    // 1. Simular encuentro (se puede llamar desde consola o por tiempo)
    socket.on("user:nearby:trigger", () => {
      const randomUser = dataManager.getRandomMockUser();
      // Guardamos temporalmente en el socket quién es la persona actual
      socket.currentEncounter = randomUser;
      io.to(userID).emit("user:nearby", randomUser);
    });

    // 2. Al recibir un gesto de 'aceptar'
    socket.on("gesture:sent", (data) => {
      if (data.gestureType === "accept" && socket.currentEncounter) {
        // Guardamos en el archivo encuentros.json
        dataManager.saveEncounter(userID, socket.currentEncounter);
        socket.currentEncounter = null;
      }

      io.to(userID).emit("gesture:received", { type: data.gestureType });
    });

    // 3. El PC pide la lista de encuentros
    socket.on("request_missed_encounters", () => {
      const history = dataManager.getEncounters(userID);
      socket.emit("missed_encounters_data", history);
    });

    // 4. Guardar perfil desde el PC
    socket.on("profile:update", (profileData) => {
      dataManager.saveProfile(userID, profileData);
      console.log(`Perfil actualizado para usuario ${userID}`);
    });
  });
};
