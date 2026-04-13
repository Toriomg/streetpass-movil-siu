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
      maxDistance: 50,
    };
  }
  return userState[userID];
}

module.exports = function (io) {
  io.on("connection", (socket) => {
    const userID = socket.handshake.auth.token;
    if (!userID) return socket.disconnect();

    socket.join(userID);

    // Enviar el perfil propio al cliente
    const profile = dataManager.getProfile(userID);
    io.to(userID).emit("profile:data", profile);

    socket.on("user:nearby:trigger", () => {
      const state = getState(userID);

      if (state.mode === "active" && state.currentEncounter) {
        console.log(
          `[Socket] Ignorando user:nearby:trigger, ya hay un encuentro activo para ${userID}`,
        );
        return;
      }

      const excludedIds = new Set([...state.shownIds, ...state.pendingIds]);
      const randomUser = dataManager.getRandomMockUser(
        userID,
        excludedIds,
        state.maxDistance,
      );
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

        case "shake":
          state.maxDistance += 15;
          console.log("distancia actual: ", state.maxDistance);
          io.to(userID).emit("gesture:received", { type: "shake" });
          break;

        case "sleep":
          if (state.mode !== "active") break;
          state.mode = "sleep";
          io.to(userID).emit("mode:change", { mode: "sleep" });
          io.to(userID).emit("gesture:received", { type: "sleep" });
          break;

        case "wake":
          if (state.mode !== "sleep") break;
          state.mode = "active";
          state.currentEncounter = null;
          io.to(userID).emit("mode:change", { mode: "active" });
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
          if (state.mode !== "stack") break;
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
