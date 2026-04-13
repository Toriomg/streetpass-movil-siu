const fs = require("fs");
const path = require("path");

const paths = {
  profiles: path.join(__dirname, "data/profiles.json"),
  mockUsers: path.join(__dirname, "data/mockUsers.json"),
  encounters: path.join(__dirname, "data/encounters.json"),
  blocked: path.join(__dirname, "data/blocked.json"),
};

// Función auxiliar para leer JSON
const readJSON = (file) => {
  if (!fs.existsSync(file)) return {};
  try {
    const content = fs.readFileSync(file, "utf-8").trim();
    if (content.length === 0) return {};
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error leyendo el archivo ${file}:`, error);
    return {};
  }
};

// Función auxiliar para escribir JSON
const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const dataManager = {
  // Obtener un usuario aleatorio para el "Streetpass" (ahora el más cercano dentro del rango)
  getRandomMockUser: (userID, shownIds = new Set(), maxDistance = 50) => {
    const users = JSON.parse(fs.readFileSync(paths.mockUsers, "utf-8"));
    const blockedIds = dataManager
      .getBlockedUsers(userID)
      .map((item) => item.id);
    const excludedIds = new Set([Number(userID), ...blockedIds, ...shownIds]);

    const available = users.filter(
      (user) => !excludedIds.has(user.id) && user.distancia <= maxDistance,
    );
    const outOfRange = users.filter(
      (user) => !excludedIds.has(user.id) && user.distancia > maxDistance,
    );

    console.log(
      "Usuarios disponibles:",
      available.map((u) => `${u.name}(${u.distancia}m)`),
    );
    console.log(
      "Usuarios fuera de rango:",
      outOfRange.map((u) => `${u.name}(${u.distancia}m)`),
    );

    if (available.length === 0) return null;
    available.sort((a, b) => a.distancia - b.distancia);
    const user = available[0];
    return { ...user, photo: `https://i.pravatar.cc/150?u=${user.id}` };
  },

  // Obtener el perfil propio del usuario (desde mockUsers)
  getProfile: (userID) => {
    const users = JSON.parse(fs.readFileSync(paths.mockUsers, "utf-8"));
    const user = users.find((u) => u.id === Number(userID));
    if (user) {
      return { ...user, photo: `https://i.pravatar.cc/150?u=${user.id}` };
    }
    return {
      id: Number(userID),
      name: `Usuario ${userID}`,
      photo: `https://i.pravatar.cc/150?u=${userID}`,
      phone: "600000000",
      interests: [],
    };
  },

  // Guardar el perfil propio (desde el PC)
  saveProfile: (userID, data) => {
    const profiles = readJSON(paths.profiles);
    profiles[userID] = { ...data, id: Number(userID) };
    writeJSON(paths.profiles, profiles);
  },

  // Guardar la lista de bloqueos del usuario
  saveBlockedUser: (userID, personData) => {
    const blocked = readJSON(paths.blocked);
    if (!blocked[userID]) blocked[userID] = [];

    if (blocked[userID].some((item) => item.id === personData.id)) return;

    blocked[userID].push({
      ...personData,
      blockedAt: new Date().toLocaleString(),
    });

    writeJSON(paths.blocked, blocked);
  },

  // Obtener usuarios bloqueados
  getBlockedUsers: (userID) => {
    const blocked = readJSON(paths.blocked);
    return blocked[userID] || [];
  },

  // Guardar un encuentro en el historial del usuario
  saveEncounter: (userID, personData) => {
    const history = readJSON(paths.encounters);
    if (!history[userID]) history[userID] = [];

    history[userID].unshift({
      ...personData,
      date: new Date().toLocaleString(),
    });
    writeJSON(paths.encounters, history);
  },

  // Obtener historial de encuentros
  getEncounters: (userID) => {
    const history = readJSON(paths.encounters);
    return history[userID] || [];
  },

  // Resetear historial de encuentros
  resetEncounters: () => {
    writeJSON(paths.encounters, {});
  },

  // NUEVA FUNCIÓN AÑADIDA CORRECTAMENTE AL OBJETO:
  // Obtiene una lista de usuarios dentro de un rango de distancia específico
  getUsersInRange: (userID, excludedIds, minDistance, maxDistance) => {
    // 1. Leemos el archivo JSON real
    const users = JSON.parse(fs.readFileSync(paths.mockUsers, "utf-8"));

    // 2. Extraemos los bloqueados para no mostrarlos tampoco
    const blockedIds = dataManager
      .getBlockedUsers(userID)
      .map((item) => item.id);
    const allExcludedIds = new Set([
      ...excludedIds,
      ...blockedIds,
      Number(userID),
    ]);

    // 3. Filtramos
    const inRange = users.filter((user) => {
      // Excluir si ya se mostró, si es él mismo, o si está bloqueado
      if (allExcludedIds.has(user.id)) return false;
      // Validar rango (ej: distancia > 0 y <= 2, o distancia > 2 y <= 4)
      if (user.distancia <= minDistance || user.distancia > maxDistance)
        return false;

      return true;
    });

    // 4. Mapeamos para añadir la URL de la foto generada como en tus otros métodos
    return inRange.map((user) => ({
      ...user,
      photo: `https://i.pravatar.cc/150?u=${user.id}`,
    }));
  },
};

// Exportación final y limpia
module.exports = dataManager;
