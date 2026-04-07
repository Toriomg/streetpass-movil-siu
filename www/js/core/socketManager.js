// www/js/core/socketManager.js

class SocketManager {
  constructor() {
    // Inicializamos la conexión solo una vez
    this.socket = null;
  }

  connect(userID) {
    // Solo conectamos si no estamos conectados ya
    if (!this.socket) {
      this.socket = io({
        auth: { token: userID },
      });
      console.log(`[Socket] Conectando como usuario: ${userID}`);
    } else {
      console.log(`[Socket] usuario: ${userID} estaba ya conectado.`);
    }
  }

  // Método para enviar datos al servidor
  emit(event, data) {
    if (!this.socket) {
      console.warn(
        `[Socket] Intento de emitir "${event}" sin conexión activa.`,
      );
      return;
    }
    this.socket.emit(event, data);
  }

  // Método para escuchar eventos del servidor
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  identifyDevice(deviceType) {
    this.emit("device:identify", deviceType);
  }
}

// Exportamos una única instancia para usarla en cualquier parte de la app
export const socketManager = new SocketManager();
