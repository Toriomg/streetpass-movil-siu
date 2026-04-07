import { BaseUI } from "./baseUI.js";
import { startClock } from "../../utils/clock.js";
import { formatearTelefono } from "../../utils/format.js";

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
        <img src="assets/icons/${interest}.svg" 
             class="interest-icon" 
             alt="${interest}">
      `,
    )
    .join("");

  return `
    <div class="profile-card">
        <img src="${data.photo}" alt="Perfil" class="profile-img">
    </div>
    <div class="info-section">
        <p class="match-text">A ${data.name} le gusta:</p>
        <div class="interests-icons">
            ${interestsHtml}
        </div>
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
            <img src="${data.photo}" class="conn-img">
            <img src="https://i.pravatar.cc/300" class="conn-img">
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

export class WatchUI extends BaseUI {
  constructor(container) {
    super(container); // Le pasamos el contenedor a la clase padre (BaseUI)
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

    if (showHeader || viewType == "watch") {
      startClock();
    }
  }
}
