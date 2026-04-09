import { BaseUI } from "./baseUI.js";

// --- COMPONENTES ATÓMICOS ---

const renderStart = () => `
    <div class="mobile-start-screen">
        <img src="assets/mobile/logo.png" class="logo-image">
    </div>
`;

const renderUserStack = (user) => {
  if (!user)
    return `
        <div class="empty-stack">
            <div class="info-icon">📍</div>
            <h2>No hay nadie cerca</h2>
            <p>Sigue caminando para encontrar nuevas conexiones.</p>
        </div>
    `;

  const interests = user.interests
    ? user.interests
        .map((g) => `<span class="interest-tag">${g}</span>`)
        .join(" ")
    : "";

  return `
        <div class="mobile-stack-container">
            <header class="stack-header">
                <p>Mientras estabas bloquead@</p>
            </header>
            
            <div class="user-card-mobile">
                <div class="image-container">
                    <img src="${user.photo}" alt="${user.name}" class="user-img">
                </div>
                <div class="user-details">
                    <h2 class="user-name">${user.name}</h2>
                    <div class="user-interests">
                        ${interests}
                    </div>
                    <p class="user-hint">${user.name} ha intentado conectar contigo hoy. Acepta para ver su teléfono.</p>
                </div>
            </div>

            <footer class="gesture-hint">
                <div class="hint-item"><span>←</span> Rechazar</div>
                <div class="hint-item">Aceptar <span>→</span></div>
            </footer>
        </div>
    `;
};

const renderStatus = () => `
    <div class="mobile-sensor-active">
        <div class="radar-animation"></div>
        <h2>Modo Sensor Activo</h2>
        <p>El móvil está funcionando como mando. Mira tu Apple Watch para ver los perfiles.</p>
        <div class="gesture-guide">
            <p><strong>En el bolsillo:</strong> 1 toque (Aceptar) | 2 toques (Rechazar)</p>
            <p><strong>En la mano:</strong> Inclinar lateralmente para navegar</p>
        </div>
    </div>
`;

// --- CLASE PRINCIPAL ---

export class MobileUI extends BaseUI {
  constructor(container) {
    super(container);
    this.pendingStack = [];
  }

  /**
   * Renderiza la interfaz del móvil
   * @param {Object} data - Datos del usuario o lista de usuarios
   * @param {string} viewType - 'start', 'stack', 'sensor'
   */
  render(data, viewType = "start") {
    let content = "";

    switch (viewType) {
      case "start":
        content = renderStart();
        break;
      case "stack":
        // Si data es un array, lo guardamos como la pila actual
        if (Array.isArray(data)) this.pendingStack = data;
        content = renderUserStack(this.pendingStack[0]);
        break;
      case "sensor":
        content = renderStatus();
        break;
      default:
        content = renderStart();
        break;
    }

    const html = `
            <div class="mobile-wrapper theme-ios">
                <main class="mobile-content">
                    ${content}
                </main>
            </div>
        `;

    this.renderTemplate(html);
  }

  // Método para avanzar en la pila cuando se hace un gesto en el móvil
  nextUser() {
    this.pendingStack.shift();
    this.render(null, "stack");
  }
}
