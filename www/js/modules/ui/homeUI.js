import { BaseUI } from "./baseUI.js";

export class HomeUI extends BaseUI {
  constructor(container) {
    super(container);
    this.pendingStack = []; // Aquí almacenaremos los usuarios pendientes
  }

  // Método que llama main.js al arrancar el modo casa
  renderBase() {
    this.renderView();
  }

  // Método que recibe el array de usuarios desde el servidor
  loadStack(users) {
    this.pendingStack = users || [];
    this.renderView();
  }

  // Método que procesa el gesto enviado desde el móvil
  processGesture(gestureType) {
    if (this.pendingStack.length === 0) return;

    // Sacamos al usuario actual de la pila
    const currentUser = this.pendingStack.shift();

    if (gestureType === "accept") {
      console.log(`Has aceptado a ${currentUser.name}`);
      // Lógica futura: enviar al servidor que hay un Match
    } else if (gestureType === "reject") {
      console.log(`Has rechazado a ${currentUser.name}`);
    } else if (gestureType === "block") {
      console.log(`Has bloqueado a ${currentUser.name}`);
    }

    // Volvemos a pintar la interfaz con el siguiente usuario de la pila
    this.renderView();
  }

  // Genera el HTML completo dependiendo de si hay usuarios o no
  render(data, viewType = "pila") {
    if (viewType === "pila" && Array.isArray(data)) {
      this.pendingStack = data;
    }
    let contentHtml = "";

    if (this.pendingStack.length === 0) {
      // ESTADO VACÍO: No hay más personas en la pila
      contentHtml = `
        <div class="empty-state">
            <h2>No hay encuentros pendientes</h2>
            <p>Sal a la calle en modo silencio para acumular perfiles aquí.</p>
        </div>
      `;
    } else {
      // ESTADO CON DATOS: Mostramos el primer usuario del array (el top de la pila)
      const topUser = this.pendingStack[0];

      // Si el usuario tiene gustos, los mapeamos
      const gustosHtml = topUser.gustos
        ? topUser.gustos.map((g) => `<span class="badge">${g}</span>`).join("")
        : "";

      contentHtml = `
        <div class="home-card">
            <img src="${topUser.photo || "https://www.loremfaces.net/128/id/1.jpg"}" alt="Foto de ${topUser.name}" class="home-profile-img">
            <h2 class="home-profile-name">${topUser.name}</h2>
            <div class="home-interests">
                ${gustosHtml}
            </div>
        </div>
        <div class="controls-hint">
            <p>Móvil a la Izquierda: <strong>Rechazar</strong> | Móvil a la Derecha: <strong>Aceptar</strong></p>
            <p>Móvil hacia Arriba: <strong>Bloquear</strong></p>
        </div>
      `;
    }

    // Estructura general de la pantalla Home
    const fullHtml = `
      <div class="home-wrapper">
          <header class="home-header">
              <h1>Modo Casa</h1>
              <p>Revisa la gente con la que te cruzaste hoy</p>
          </header>
          <main class="home-content">
              ${contentHtml}
          </main>
      </div>
    `;

    // Usamos el método genérico del padre (BaseUI) para inyectarlo en el DOM
    this.renderTemplate(fullHtml);
  }
}
