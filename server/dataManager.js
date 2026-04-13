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
  // 1. Si el archivo no existe, devolvemos objeto vacío
  if (!fs.existsSync(file)) return {};

  try {
    const content = fs.readFileSync(file, "utf-8").trim();

    // 2. Si el archivo existe pero está vacío (0 caracteres), devolvemos objeto vacío
    if (content.length === 0) return {};

    // 3. Intentamos parsear
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error leyendo el archivo ${file}:`, error);
    return {}; // Devolvemos algo seguro para que el servidor no muera
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
    return {
      ...user,
      photo: user.photo || `https://i.pravatar.cc/150?u=${user.id}`
    };
  },

  // Obtener el perfil propio del usuario (desde mockUsers)
  getProfile: (userID) => {
    const users = JSON.parse(fs.readFileSync(paths.mockUsers, "utf-8"));
    const user = users.find((u) => u.id === Number(userID));
    if (user) {
      return {
        ...user,
        photo: user.photo || `https://i.pravatar.cc/150?u=${user.id}`
      };
    }
    // Perfil por defecto si no existe
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

    // Añadimos al principio (pila cronológica inversa)
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
};

module.exports = dataManager;
