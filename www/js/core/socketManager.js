// www/js/core/socketManager.js

class SocketManager {
  constructor() {
    // Inicializamos la conexión solo una vez
    this.socket = io();
  }

  // Método para enviar datos al servidor
  emit(event, data) {
    this.socket.emit(event, data);
  }

  // Método para escuchar eventos del servidor
  on(event, callback) {
    this.socket.on(event, callback);
  }

  // Método específico para tu lógica de identificación
  identifyDevice(deviceType) {
    this.emit("device:identify", deviceType);
  }
}

// Exportamos una única instancia para usarla en cualquier parte de la app
export const socketManager = new SocketManager();
