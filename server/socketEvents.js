const dataManager = require("./dataManager");

// Estado compartido por usuario (no por socket)
const userState = {};

function getState(userID) {
  if (!userState[userID]) {
    userState[userID] = {
      mode: "active",
      sleepQueue: [],
      currentEncounter: null,
      shownIds: new Set(),
      pendingIds: new Set(),
      maxDistance: 20,
    };
  }
  return userState[userID];
}

module.exports = function (io) {
  io.on("connection", (socket) => {
    const userID = socket.handshake.auth.token;
    if (!userID) return socket.disconnect();

    const state = getState(userID);
    state.shownIds = new Set();    // Permite que vuelvan a salir las mismas personas
    state.pendingIds = new Set();  // Limpia registros temporales
    state.currentEncounter = null; // Desbloquea el trigger
    state.maxDistance = 20;        // El rango siempre empieza desde 20m en cada sesión

    socket.join(userID);

    // Enviar el perfil solo al socket que acaba de conectar (no a toda la sala)
    const profile = dataManager.getProfile(userID);
    socket.emit("profile:data", profile);

    socket.on("user:nearby:trigger", () => {
      const state = getState(userID);

      // if (state.mode === "active" && state.currentEncounter) {
      //   console.log(
      //     `[Socket] Ignorando user:nearby:trigger, ya hay un encuentro activo para ${userID}`,
      //   );
      //   return;
      // }

      let excludedIds = new Set([...state.shownIds, ...state.pendingIds]);
      let randomUser = dataManager.getRandomMockUser(userID, excludedIds, state.maxDistance);

      // Si no quedan personas disponibles, reiniciar el ciclo (solo shownIds, no pendingIds)
      if (!randomUser && state.shownIds.size > 0) {
        console.log(`[Socket] Pool agotado para ${userID} — reiniciando ciclo`);
        state.shownIds = new Set();
        excludedIds = new Set([...state.pendingIds]);
        randomUser = dataManager.getRandomMockUser(userID, excludedIds, state.maxDistance);
      }

      if (!randomUser) {
        console.log(
          `[Socket] Sin personas nuevas para ${userID} — todas vistas o fuera de rango`,
        );
        io.to(userID).emit("user:nearby:empty");
        return;
      }

      state.pendingIds.add(randomUser.id);

      if (state.mode === "sleep" || state.mode === "stack") {
        const alreadyQueued = state.sleepQueue.some(
          (u) => u.id === randomUser.id,
        );
        if (!alreadyQueued && state.sleepQueue.length < 20) {
          state.sleepQueue.push(randomUser);
          if (state.mode === "sleep") {
            console.log(`[Sleep] ${randomUser.name} añadido a la cola (total: ${state.sleepQueue.length})`);
            io.to(userID).emit("user:queued", randomUser);
          }
        }
        return;
      }

      state.currentEncounter = randomUser;
      io.to(userID).emit("user:nearby", randomUser);
    });

    socket.on("user:block", (personData) => {
      if (!personData || !personData.id) return;
      const state = getState(userID);
      dataManager.saveBlockedUser(userID, personData);
      state.currentEncounter = null;
      io.to(userID).emit("user:blocked", { blockedId: personData.id });
    });

    // ─────────────────────────────────────────────
    // Máquina de estados de gestos
    // ─────────────────────────────────────────────
    socket.on("gesture:sent", (data) => {
      const { gestureType } = data || {};
      if (!gestureType) return;

      const state = getState(userID);
      console.log(
        `[Socket] Usuario ${userID} | modo: ${state.mode} | gesto: ${gestureType}`,
      );

      switch (gestureType) {
        case "accept":
          if (state.currentEncounter) {
            dataManager.saveEncounter(userID, state.currentEncounter);
            state.shownIds.add(state.currentEncounter.id);
            state.pendingIds.delete(state.currentEncounter.id);
            state.currentEncounter = null;
          }
          io.to(userID).emit("gesture:received", { type: "accept" });
          break;

        case "nav":
          if (state.currentEncounter) {
            state.shownIds.add(state.currentEncounter.id);
            state.pendingIds.delete(state.currentEncounter.id);
            state.currentEncounter = null;
          }
          io.to(userID).emit("gesture:received", { type: "nav" });
          break;

        case "block":
          if (!state.currentEncounter) break;
          dataManager.saveBlockedUser(userID, state.currentEncounter);
          state.shownIds.add(state.currentEncounter.id);
          state.pendingIds.delete(state.currentEncounter.id);
          io.to(userID).emit("user:blocked", {
            blockedId: state.currentEncounter.id,
          });
          state.currentEncounter = null;
          io.to(userID).emit("gesture:received", { type: "block" });
          break;

        case "exit":
          state.mode = "active";
          state.currentEncounter = null;
          state.sleepQueue = [];
          io.to(userID).emit("mode:change", { mode: "active" });
          io.to(userID).emit("gesture:received", { type: "exit" });
          break;

        case "shake": {
          const MAX_DISTANCE = 100;
          if (state.maxDistance < MAX_DISTANCE) {
            state.maxDistance = Math.min(state.maxDistance + 20, MAX_DISTANCE);
          }
          console.log(`[Rango] Usuario ${userID} → ${state.maxDistance}m`);
          io.to(userID).emit("gesture:received", {
            type: "shake",
            distance: state.maxDistance,
            atMax: state.maxDistance >= MAX_DISTANCE,
          });
          break;
        }

        case "sleep":
          if (state.mode !== "active") break;
          state.mode = "sleep";
          console.log(`[Sleep] Usuario ${userID} entra en modo bloqueo`);
          io.to(userID).emit("mode:change", { mode: "sleep" });
          io.to(userID).emit("gesture:received", { type: "sleep" });
          break;

        case "wake":
          if (state.mode !== "sleep") break;

          // 1. Si hay personas acumuladas, las enviamos al móvil
          if (state.sleepQueue.length > 0) {
            // Enviamos la lista acumulada
            io.to(userID).emit("missed_encounters_data", state.sleepQueue);

            // Cambiamos a modo 'stack' para que el móvil sepa que debe mostrar la lista
            state.mode = "stack";
            io.to(userID).emit("mode:change", { mode: "stack" });
          } else {
            // Si no hay nadie, activamos normal
            state.mode = "active";
            io.to(userID).emit("mode:change", { mode: "active" });
          }

          state.currentEncounter = null;
          io.to(userID).emit("gesture:received", { type: "wake" });
          break;

        case "stack-open": {
          if (state.mode !== "sleep") break;
          state.mode = "stack";
          io.to(userID).emit("mode:change", { mode: "stack" });
          io.to(userID).emit("missed_encounters_data", state.sleepQueue);
          console.log(
            `[Socket] Usuario ${userID} | abriendo pila → ${state.sleepQueue.length} personas`,
          );
          break;
        }

        case "stack-close":
          if (state.mode !== "stack" && state.mode !== "sleep") break;
          state.mode = "active";
          state.sleepQueue = [];
          io.to(userID).emit("mode:change", { mode: "active" });
          io.to(userID).emit("gesture:received", { type: "stack-close" });
          break;

        default:
          console.warn(`[Socket] Gesto desconocido: ${gestureType}`);
      }
    });

    socket.on("gesture:lock", ({ ms } = {}) => {
      io.to(userID).emit("gesture:lock", { ms: ms || 1500 });
    });

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
