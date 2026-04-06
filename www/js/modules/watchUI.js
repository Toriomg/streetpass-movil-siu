// js/modules/watchUI.js

const renderHeader = (time = "11:37") => `
    <header class="watch-header">
        <span class="watch-time">${time}</span>
    </header>
`;

const renderProfile = (data) => `
    <div class="profile-card">
        <img src="assets/${data.photo}" alt="Perfil" class="profile-img">
    </div>
    <div class="info-section">
        <p class="match-text">A ambos os gusta:</p>
        <div class="interests-icons">
            <img src="assets/icons/aguila.png" class="interest-icon">
            <img src="assets/icons/how.png" class="interest-icon">
            <img src="assets/icons/supernova.png" class="interest-icon">
        </div>
    </div>
`;

const renderMatch = (data) => `
    <div class="match-overlay">
        <div class="match-card">
            <img src="assets/${data.photo}" alt="Perfil" class="profile-img">
        </div>
        <h2 class="match-title">Conoce a ${data.name}</h2>
        <p class="match-description">${data.name} está cerca y se ha fijado en ti. Es un buen momento para empezar una conversación</p>
    </div>
`;

const renderConnection = (data) => `
    <div class="connection-overlay">
        <div class="connection-photos">
            <img src="assets/${data.photo}" class="conn-img">
            <img src="assets/${data.photo}" class="conn-img">
        </div>
        <h2 class="conn-title">¡Feliz conexión!</h2>
        <p class="description">Aquí tienes el teléfono de ${data.name} para seguir conectando.</p>
        <div class="phone-button">${data.phone || "+34 600 000 000"}</div>
    </div>
`;

const renderMessage = (data) => `
    <div class="message-overlay">
        <div class="warning-icon">⚠️</div>
        <p class="message-text">${data.message || "Has ampliado el rango de búsqueda de personas "}</p>
    </div>
`;

export const watchUI = {
  render: (data, viewType = "connection") => {
    let content = "";
    let showHeader = false;

    switch (viewType) {
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
    }

    return `
        <div class="watch-wrapper">
            <div class="watch-background"></div>
            ${showHeader ? renderHeader(data.time) : ""}
            <main class="watch-content">
                ${content}
            </main>
        </div>
    `;
  },
};