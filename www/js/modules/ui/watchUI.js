import { BaseUI } from "./baseUI.js";
import { startClock } from "../../utils/clock.js";
import { formatearTelefono } from "../../utils/format.js";
import { socketManager } from "../../core/socketManager.js";

const renderHeader = () => {
  return `
    <header class="watch-header">
        <span class="watch-time" id="watch-time">00:00</span>
    </header>
    `;
};

const renderWatch = (data) => {
  return `
    <div class="watch-header">
        <span class="watch-time watch-time-large" id="watch-time">00:00</span>
    </div>
    `;
};

const renderProfile = (data) => {
  const interestsHtml = data.interests
    .map(
      (interest) => `
        <img src="assets/icons/iconos/${interest}.svg"
             class="interest-icon"
             alt="${interest}">
      `,
    )
    .join("");

  const distanciaHtml = data.distancia != null
    ? `<span class="profile-distance">📍 ${data.distancia} m</span>`
    : "";

  return `
    <div class="profile-card">
        <img src="${data.photo}" alt="Perfil" class="profile-img">
        <div class="swipe-indicator" id="swipe-indicator"></div>
    </div>
    <div class="info-section">
        <p class="match-text">A ${data.name} le gusta: ${distanciaHtml}</p>
        <div class="interests-icons">
            ${interestsHtml}
        </div>
    </div>
    <div class="profile-actions">
        <button class="block-btn">Bloquear usuario</button>
    </div>
  `;
};

const renderMatch = (data) => `
    <div class="match-overlay">
        <div class="match-card">
            <img src="${data.photo}" alt="Perfil" class="profile-img">
        </div>
        <h2 class="match-title">Conoce a ${data.name}</h2>
        <p class="match-description">${data.name} está cerca y se ha fijado en ti. Es un buen momento para empezar una conversación</p>
    </div>
`;

const renderConnection = (data) => `
    <div class="connection-overlay">
        <div class="connection-photos">
            <img src="${data.userPhoto || 'https://i.pravatar.cc/300'}" class="conn-img">
            <img src="${data.photo}" class="conn-img">
        </div>
        <h2 class="conn-title">¡Feliz conexión!</h2>
        <p class="description">Aquí tienes el teléfono de ${data.name} para seguir conectando.</p>
        <div class="phone-button">${formatearTelefono(data.phone)}</div>
    </div>
`;

const renderMessage = (data) => `
    <div class="message-overlay">
        <div class="warning-icon">⚠️</div>
        <p class="message-text">${data.message || "Has ampliado el rango de búsqueda de personas "}</p>
    </div>
`;

const renderSleep = () => `
    <div class="watch-header">
        <span class="watch-time watch-time-large" id="watch-time">00:00</span>
    </div>
    <div class="closed-indicator">
        <span class="closed-dot" style="background:rgba(100,160,255,0.9);box-shadow:0 0 6px rgba(100,160,255,0.6)"></span>
        Modo bloqueo
    </div>
`;

const renderClosed = () => `
    <div class="watch-header">
        <span class="watch-time watch-time-large" id="watch-time">00:00</span>
    </div>
    <div class="closed-indicator">
        <span class="closed-dot"></span>
        App cerrada
    </div>
`;

export class WatchUI extends BaseUI {
  constructor(container) {
    super(container); // Le pasamos el contenedor a la clase padre (BaseUI)
  }

  showSwipeIndicator(type, callback) {
    const el = document.getElementById("swipe-indicator");
    if (!el) { callback(); return; }

    el.className = "swipe-indicator " + (type === "accept" ? "swipe-accept" : "swipe-reject");
    el.textContent = type === "accept" ? "LIKE" : "NOPE";

    setTimeout(callback, 600);
  }

  // Ya no necesitamos pasar el 'container' por parámetro porque lo tiene el padre
  render(data, viewType = "watch") {
    let content = "";
    let showHeader = false;

    switch (viewType) {
      case "watch":
        content = renderWatch(data);
        break;
      case "profile":
        content = renderProfile(data);
        showHeader = true;
        break;
      case "match":
        content = renderMatch(data);
        break;
      case "connection":
        content = renderConnection(data);
        break;
      case "message":
        content = renderMessage(data);
        showHeader = true;
        break;
      case "sleep":
        content = renderSleep();
        break;
      case "closed":
        content = renderClosed();
        break;
      default: // Default el reloj
        content = renderWatch(data);
        break;
    }

    const html = `
        <div class="watch-wrapper">
            <div class="watch-background"></div>
            ${showHeader ? renderHeader() : ""}
            <main class="watch-content">
                ${content}
            </main>
        </div>
    `;

    // Usamos el método de la clase padre para inyectar el HTML
    this.renderTemplate(html);

    if (viewType === "profile") {
      this.addEvent(".block-btn", "click", () => {
        if (!data || !data.id) return;
        socketManager.emit("user:block", {
          id: data.id,
          name: data.name,
          phone: data.phone,
          interests: data.interests,
        });
        this.render(null, "watch");
      });
    }

    if (showHeader || viewType === "watch" || viewType === "closed" || viewType === "sleep") {
      startClock();
    }
  }
}
