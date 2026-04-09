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
  // Obtener un usuario aleatorio para el "Streetpass"
  getRandomMockUser: (userID) => {
    const users = JSON.parse(fs.readFileSync(paths.mockUsers, "utf-8"));
    const excludedIds = new Set([
      Number(userID),
      ...dataManager.getBlockedUsers(userID).map((item) => item.id),
    ]);

    const availableUsers = users.filter((user) => !excludedIds.has(user.id));
    const pool =
      availableUsers.length > 0
        ? availableUsers
        : users.filter((user) => user.id !== Number(userID));

    if (pool.length === 0) return null;

    const user = pool[Math.floor(Math.random() * pool.length)];
    return { ...user, photo: `https://i.pravatar.cc/150?u=${user.id}` };
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
};

module.exports = dataManager;
