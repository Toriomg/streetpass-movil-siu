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
                <div class="hint-item"><span>←</span> Conectar</div>
                <div class="hint-item">Pasar <span>→</span></div>
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

        <button class="exit-block-btn">Salir del modo bloqueo</button>
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

const renderSleepStack = (user, count = 1) => {
  // Estado vacío lo gestiona render() mostrando recomendaciones
  if (!user) return "";

  const interests = user.interests
    ? user.interests.map(g => `<span class="interest-tag">${g}</span>`).join(" ")
    : "";

  const badge = count > 1
    ? `<span class="sleep-badge">${count} pendientes</span>`
    : "";

  return `
    <div class="mobile-stack-container sleep-stack">
      <header class="stack-header">
        <div class="sleep-header-row">
          <span class="sleep-icon">🌙</span>
          <p>Mientras estabas bloquead@</p>
          ${badge}
        </div>
      </header>

      <div class="user-card-mobile">
        <div class="mobile-swipe-indicator" id="mobile-swipe-indicator"></div>
        <div class="image-container">
          <img src="${user.photo}" alt="${user.name}" class="user-img">
        </div>
        <div class="user-details">
          <h2 class="user-name">${user.name}</h2>
          <div class="user-interests">${interests}</div>
          <p class="user-hint">${user.name} pasó cerca mientras tenías el reloj guardado.</p>
        </div>
      </div>

      <footer class="gesture-hint">
        <div class="hint-item hint-accept"><span>←</span> Conectar</div>
        <div class="hint-item hint-reject">Pasar <span>→</span></div>
      </footer>
    </div>
  `;
};

const renderAppClosed = () => `
    <div class="mobile-sensor-active">
        <div class="radar-animation" style="opacity:0.2; filter:grayscale(1) brightness(0.5)"></div>
        <h2>App cerrada</h2>
        <p>Da tres toques para volver a abrirla.</p>
    </div>
`;

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
    this.currentViewType = "start";
  }

  setUserProfile(profile) {
    this.profile = profile;
  }

  // Añade un usuario al final de la pila sin resetearla.
  // Si la pila estaba vacía (mostrando recomendaciones), re-renderiza para mostrar la tarjeta.
  pushUser(user) {
    this.pendingStack.push(user);
    if (this.pendingStack.length === 1 &&
        (this.currentViewType === "sleep-list" || this.currentViewType === "stack")) {
      this.render(null, this.currentViewType);
    }
  }

  // Anima la tarjeta y avanza a la siguiente — NO emite gesto al servidor.
  // Usar cuando el gesto ya fue enviado por gestures.js (flujo físico).
  // accept → vuela a la IZQUIERDA (gesto físico: inclinar izquierda = conectar)
  // reject → vuela a la DERECHA  (gesto físico: inclinar derecha  = pasar)
  _animateCard(direction) {
    if (this.isAnimating || !this.pendingStack[0]) return;

    this.isAnimating = true;
    const card = this.container.querySelector(".user-card-mobile");
    if (!card) {
      this.isAnimating = false;
      return;
    }

    // Mostrar indicador CONECTAR/PASAR
    const indicator = this.container.querySelector("#mobile-swipe-indicator");
    if (indicator) {
      indicator.textContent = direction === "accept" ? "CONECTAR" : "PASAR";
      indicator.className = "mobile-swipe-indicator " + (direction === "accept" ? "mobile-swipe-accept" : "mobile-swipe-reject");
    }

    card.classList.add(direction === "accept" ? "swipe-left" : "swipe-right");

    setTimeout(() => {
      card.classList.remove("swipe-right", "swipe-left");
      this.nextUser();
      this.isAnimating = false;
    }, 500);
  }

  emitGesture(gestureType) {
    socketManager.emit("gesture:sent", { gestureType });
  }

  // Llamado desde main.js cuando llega gesture:received — el gesto ya está en el servidor.
  processGesture(type) {
    console.log(`[MobileUI] Gesto recibido: ${type}`);
    if (type === "accept") {
      this._animateCard("accept");
    } else if (type === "nav") {
      this._animateCard("reject");
    }
  }

  // Swipe táctil directo en pantalla — emite el gesto además de animar.
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

      // Mostrar indicador mientras se arrastra
      const indicator = this.container.querySelector("#mobile-swipe-indicator");
      if (indicator) {
        if (Math.abs(diff) > 40) {
          const isAccept = diff < 0;
          indicator.textContent = isAccept ? "CONECTAR" : "PASAR";
          indicator.className = "mobile-swipe-indicator " + (isAccept ? "mobile-swipe-accept" : "mobile-swipe-reject");
          indicator.style.opacity = Math.min(1, (Math.abs(diff) - 40) / 60).toString();
        } else {
          indicator.className = "mobile-swipe-indicator";
          indicator.style.opacity = "0";
        }
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = "transform 0.3s ease";

      const diff = currentX - startX;
      if (Math.abs(diff) > 100) {
        // Swipe izquierda (diff < 0) = conectar/accept  (igual que inclinar izquierda)
        // Swipe derecha  (diff > 0) = pasar/nav         (igual que inclinar derecha)
        const gestureType = diff > 0 ? "nav" : "accept";
        this._animateCard(diff > 0 ? "reject" : "accept");
        this.emitGesture(gestureType);
      } else {
        card.style.transform = "";
        const indicator = this.container.querySelector("#mobile-swipe-indicator");
        if (indicator) {
          indicator.className = "mobile-swipe-indicator";
          indicator.style.opacity = "0";
        }
      }
    };

    card.addEventListener("touchstart", handleStart);
    card.addEventListener("touchmove", handleMove);
    card.addEventListener("touchend", handleEnd);
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
      case "sleep-list":
        // Si llega un array lo guardamos como pila, luego renderizamos la primera tarjeta
        if (Array.isArray(data)) this.pendingStack = [...data];
        if (this.pendingStack[0]) {
          content = renderSleepStack(this.pendingStack[0], this.pendingStack.length);
        } else {
          // Pila agotada → mostrar recomendaciones
          content = renderRecommendations(
            this.getRecommendations(),
            this.getLocationLabel(),
            this.locationError,
          );
        }
        break;
      case "app-closed":
        content = renderAppClosed();
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

    this.currentViewType = viewType;
    this.renderTemplate(html);

    // Botones de recomendaciones (stack vacío o sleep-list agotada)
    const showingRecos =
      (viewType === "stack" && !this.pendingStack[0]) ||
      (viewType === "sleep-list" && !this.pendingStack[0]);
    if (showingRecos) {
      this.addEvent(".location-btn", "click", () => this.requestLocation());
      this.addEvent(".refresh-btn", "click", () => this.render(null, viewType));
      this.addEvent(".exit-block-btn", "click", () => {
        socketManager.emit("gesture:sent", { gestureType: "stack-close" });
      });
    }

    // Inicializar gestos de swipe si hay usuario (stack o sleep-list)
    if ((viewType === "stack" || viewType === "sleep-list") && this.pendingStack[0]) {
      this.initSwipeGestures();
    }
  }

  // Método para avanzar en la pila cuando se hace un gesto en el móvil
  nextUser() {
    this.pendingStack.shift();
    // Mantener el mismo tipo de vista (stack normal o sleep-list)
    this.render(null, this.currentViewType === "sleep-list" ? "sleep-list" : "stack");
  }
}
