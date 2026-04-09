import { BaseUI } from "./baseUI.js";

// --- COMPONENTES ATÓMICOS ---

const renderStart = () => `
    <div class="mobile-start-screen">
        <img src="assets/mobile/logo.png" class="logo-image">
    </div>
`;

const renderUserStack = (
  user,
  recommendations,
  locationLabel,
  locationError,
) => {
  if (!user)
    return renderRecommendations(recommendations, locationLabel, locationError);

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

const renderRecommendations = (
  recommendations,
  locationLabel,
  locationError,
) => `
    <div class="recommendation-screen">
        <header class="stack-header">
            <h3>No hay nadie cerca</h3>
            <p class="recommendation-subtitle">Te proponemos planes y restaurantes según tus gustos.</p>
        </header>

        <div class="recommendation-list">
            ${recommendations
              .map(
                (item) => `
                    <div class="reco-card">
                        <strong>${item.title}</strong>
                        <p>${item.description}</p>
                    </div>
                `,
              )
              .join("")}
        </div>

        <div class="location-panel">
            <div class="location-title">Ubicación actual del móvil</div>
            <div class="location-value">${locationLabel}</div>
            ${locationError ? `<div class="location-error">${locationError}</div>` : ""}
        </div>

        <div class="recommend-actions">
            <button class="location-btn">Ver mi ubicación</button>
            <button class="refresh-btn">Actualizar planes</button>
        </div>
    </div>
`;

const buildRecommendations = (interests) => {
  const map = {
    Películas: [
      {
        title: "Cine Central",
        description: "Películas actuales y snacks cerca de tu zona.",
      },
      {
        title: "Cafetería & Cine",
        description: "Combo de cine y café para una tarde perfecta.",
      },
    ],
    Música: [
      {
        title: "Sala de conciertos",
        description: "Conciertos y sesiones en directo esta semana.",
      },
      {
        title: "Bar de jazz",
        description: "Ambiente chill para escuchar buena música.",
      },
    ],
    Senderismo: [
      {
        title: "Ruta natural",
        description: "Una caminata corta ideal para desconectar.",
      },
      {
        title: "Mercado al aire libre",
        description: "Plan de fin de semana con productos locales.",
      },
    ],
    Gimnasio: [
      {
        title: "Clase de spinning",
        description: "Sesión activa pensada para quemar energía.",
      },
      {
        title: "Entrenamiento funcional",
        description: "Prueba una clase moderna cerca de ti.",
      },
    ],
  };

  const matched = interests
    .flatMap((interest) => map[interest] || [])
    .slice(0, 3);

  if (matched.length > 0) return matched;

  return [
    {
      title: "Plan local",
      description:
        "Descubre un plan interesante cerca de ti, basado en tus actividades.",
    },
    {
      title: "Restaurante recomendado",
      description: "Una zona gastronómica con opciones para tus gustos.",
    },
  ];
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
    this.profile = null;
    this.location = null;
    this.locationError = null;
  }

  setUserProfile(profile) {
    this.profile = profile;
  }

  processGesture(type) {
    console.log(`Gesto recibido en Móvil: ${type}`);
    if (type === "accept" || type === "reject") {
      this.nextUser(); // Ambos gestos avanzan la pila en esta versión
    }
  }

  async requestLocation() {
    if (!navigator.geolocation) {
      this.locationError = "Tu navegador no soporta geolocalización.";
      this.render(null, "stack");
      return;
    }

    this.locationError = null;
    const onSuccess = (position) => {
      this.location = position;
      this.render(null, "stack");
    };

    const onError = (error) => {
      this.locationError = error.message;
      this.location = null;
      this.render(null, "stack");
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }

  getLocationLabel() {
    if (this.location) {
      const { latitude, longitude } = this.location.coords;
      return `Lat: ${latitude.toFixed(5)} · Lon: ${longitude.toFixed(5)}`;
    }
    return "Pulsa para obtener tu ubicación";
  }

  getRecommendations() {
    if (!this.profile || !Array.isArray(this.profile.interests)) {
      return buildRecommendations([]);
    }
    return buildRecommendations(this.profile.interests);
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
        content = renderUserStack(
          this.pendingStack[0],
          this.getRecommendations(),
          this.getLocationLabel(),
          this.locationError,
        );
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

    if (viewType === "stack" && !this.pendingStack[0]) {
      this.addEvent(".location-btn", "click", () => this.requestLocation());
      this.addEvent(".refresh-btn", "click", () => this.render(null, "stack"));
    }
  }

  // Método para avanzar en la pila cuando se hace un gesto en el móvil
  nextUser() {
    this.pendingStack.shift();
    this.render(null, "stack");
  }
}
