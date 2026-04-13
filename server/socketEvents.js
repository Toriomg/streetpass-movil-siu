const dataManager = require("./dataManager");

module.exports = function (io) {
  io.on("connection", (socket) => {
    const userID = socket.handshake.auth.token;
    if (!userID) return socket.disconnect();

    socket.join(userID);

    // Estado por conexión
    socket.mode = "active";          // "active" | "sleep" | "stack"
    socket.currentEncounter = null;  // Persona que se está mostrando ahora mismo

    // Enviar el perfil propio al cliente
    const profile = dataManager.getProfile(userID);
    io.to(userID).emit("profile:data", profile);

    socket.on("user:nearby:trigger", () => {
      const randomUser = dataManager.getRandomMockUser(userID);
      if (!randomUser) return;
      socket.currentEncounter = randomUser;
      io.to(userID).emit("user:nearby", randomUser);
    });

    socket.on("user:block", (personData) => {
      if (!personData || !personData.id) return;
      dataManager.saveBlockedUser(userID, personData);
      socket.currentEncounter = null;
      io.to(userID).emit("user:blocked", { blockedId: personData.id });
    });

    // ─────────────────────────────────────────────
    // Máquina de estados de gestos
    // ─────────────────────────────────────────────
    socket.on("gesture:sent", (data) => {
      const { gestureType } = data || {};
      if (!gestureType) return;

      console.log(`[Socket] Usuario ${userID} | modo: ${socket.mode} | gesto: ${gestureType}`);

      switch (gestureType) {

        // ── CONECTAR / ACEPTAR ──────────────────
        case "accept":
          if (socket.currentEncounter) {
            dataManager.saveEncounter(userID, socket.currentEncounter);
            socket.currentEncounter = null;
          }
          io.to(userID).emit("gesture:received", { type: "accept" });
          break;

        // ── PASAR / SIGUIENTE ───────────────────
        case "nav":
          socket.currentEncounter = null;
          io.to(userID).emit("gesture:received", { type: "nav" });
          break;

        // ── BLOQUEAR USUARIO ────────────────────
        case "block":
          if (socket.currentEncounter) {
            dataManager.saveBlockedUser(userID, socket.currentEncounter);
            io.to(userID).emit("user:blocked", { blockedId: socket.currentEncounter.id });
            socket.currentEncounter = null;
          }
          io.to(userID).emit("gesture:received", { type: "block" });
          break;

        // ── CERRAR APLICACIÓN ───────────────────
        // Válido en cualquier modo — siempre vuelve a activo
        case "exit":
          socket.mode = "active";
          socket.currentEncounter = null;
          io.to(userID).emit("mode:change", { mode: "active" });
          io.to(userID).emit("gesture:received", { type: "exit" });
          break;

        // ── AMPLIAR RANGO ────────────────────────
        case "shake":
          io.to(userID).emit("gesture:received", { type: "shake" });
          break;

        // ── ENTRAR EN MODO BLOQUEO ───────────────
        // (bajar el reloj — solo desde activo)
        case "sleep":
          if (socket.mode !== "active") break;
          socket.mode = "sleep";
          io.to(userID).emit("mode:change", { mode: "sleep" });
          io.to(userID).emit("gesture:received", { type: "sleep" });
          break;

        // ── SUBIR RELOJ → VOLVER A ACTIVO ────────
        // (solo desde sleep, sin abrir la pila)
        case "wake":
          if (socket.mode !== "sleep") break;
          socket.mode = "active";
          socket.currentEncounter = null;
          io.to(userID).emit("mode:change", { mode: "active" });
          io.to(userID).emit("gesture:received", { type: "wake" });
          break;

        // ── SACAR TELÉFONO → VER PILA ─────────────
        // (solo desde sleep — abre la lista de personas vistas mientras dormía)
        case "stack-open": {
          if (socket.mode !== "sleep") break;
          socket.mode = "stack";
          io.to(userID).emit("mode:change", { mode: "stack" });
          const encounters = dataManager.getEncounters(userID);
          io.to(userID).emit("missed_encounters_data", encounters);
          break;
        }

        // ── BAJAR TELÉFONO → VOLVER A BLOQUEO ────
        // (solo desde stack)
        case "stack-close":
          if (socket.mode !== "stack") break;
          socket.mode = "sleep";
          io.to(userID).emit("mode:change", { mode: "sleep" });
          io.to(userID).emit("gesture:received", { type: "stack-close" });
          break;

        default:
          console.warn(`[Socket] Gesto desconocido: ${gestureType}`);
      }
    });

    // El PC pide la lista de encuentros manualmente
    socket.on("request_missed_encounters", () => {
      const history = dataManager.getEncounters(userID);
      socket.emit("missed_encounters_data", history);
    });

    socket.on("profile:update", (profileData) => {
      dataManager.saveProfile(userID, profileData);
      console.log(`Perfil actualizado para usuario ${userID}`);
    });
  });
};