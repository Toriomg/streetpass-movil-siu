import { BaseUI } from "./baseUI.js";
import { socketManager } from "../../core/socketManager.js";

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
            <p><strong>Inclinar derecha:</strong> Pasar persona</p>
            <p><strong>Inclinar izquierda:</strong> Conectar</p>
            <p><strong>Inclinar arriba:</strong> Bloquear usuario</p>
            <p><strong>Doble toque:</strong> Cerrar app</p>
            <p><strong>Agitar:</strong> Ampliar rango</p>
            <p><strong>Bajar brazo:</strong> Modo bloqueo</p>
        </div>
    </div>
`;

const renderBlockMode = () => `
    <div class="mobile-sensor-active">
        <div class="radar-animation" style="opacity: 0.3; filter: grayscale(1);"></div>
        <h2>Modo Bloqueo</h2>
        <p>El reloj está guardado. Las personas cercanas se están almacenando.</p>
        <div class="gesture-guide">
            <p><strong>Subir brazo suave:</strong> Volver al modo activo</p>
            <p><strong>Sacar el teléfono:</strong> Ver personas vistas</p>
            <p><strong>Doble toque:</strong> Cerrar app</p>
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
    this.isAnimating = false;
  }

  setUserProfile(profile) {
    this.profile = profile;
  }

  // Método para procesar gestos con animación
  processGestureWithAnimation(gestureType) {
    if (this.isAnimating || !this.pendingStack[0]) return;

    this.isAnimating = true;
    const card = this.container.querySelector(".user-card-mobile");
    if (!card) {
      this.isAnimating = false;
      return;
    }

    // Añadir clase de animación
    if (gestureType === "accept") {
      card.classList.add("swipe-right");
    } else if (gestureType === "reject") {
      card.classList.add("swipe-left");
    }

    // Después de la animación, quitar la clase y procesar
    setTimeout(() => {
      card.classList.remove("swipe-right", "swipe-left");
      this.nextUser();
      this.isAnimating = false;
      // Enviar gesto al servidor
      this.emitGesture(gestureType);
    }, 500); // Duración de la animación
  }

  emitGesture(gestureType) {
    socketManager.emit("gesture:sent", { gestureType });
  }

  // Método para manejar swipe manual
  initSwipeGestures() {
    const card = this.container.querySelector(".user-card-mobile");
    if (!card) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      card.style.transition = "none";
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      card.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = "transform 0.3s ease";

      const diff = currentX - startX;
      if (Math.abs(diff) > 100) {
        if (diff > 0) {
          this.processGestureWithAnimation("accept");
        } else {
          this.processGestureWithAnimation("reject");
        }
      } else {
        card.style.transform = "";
      }
    };

    card.addEventListener("touchstart", handleStart);
    card.addEventListener("touchmove", handleMove);
    card.addEventListener("touchend", handleEnd);
  }

  processGesture(type) {
    console.log(`Gesto recibido en Móvil: ${type}`);
    if (type === "accept") {
      this.processGestureWithAnimation("accept");
    } else if (type === "nav") {
      // nav = pasar/siguiente → animación de rechazo visual
      this.processGestureWithAnimation("reject");
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
      case "block-mode":
        content = renderBlockMode();
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

    // Inicializar gestos de swipe si hay usuario
    if (viewType === "stack" && this.pendingStack[0]) {
      this.initSwipeGestures();
    }
  }

  // Método para avanzar en la pila cuando se hace un gesto en el móvil
  nextUser() {
    this.pendingStack.shift();
    this.render(null, "stack");
  }
}
