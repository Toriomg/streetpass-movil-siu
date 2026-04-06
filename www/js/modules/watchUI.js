// js/modules/watchUI.js

const renderHeader = () => `
    <header class="watch-header">
        <span class="watch-time">11:37</span>
    </header>
`;

const renderProfile = (photo) => `
    <div class="profile-card">
        <img src="assets/${photo}" alt="Perfil" class="profile-img">
    </div>
`;

const renderInterests = () => `
    <div class="info-section">
        <p class="match-text">A ambos os gusta:</p>
        <div class="interests-icons">
            <img src="assets/icons/aguila.png" class="interest-icon">
            <img src="assets/icons/how.png" class="interest-icon">
            <img src="assets/icons/supernova.png" class="interest-icon">
        </div>
    </div>
`;

export const watchUI = {
  render: (data) => {
    return `
        <div class="watch-wrapper">
            <div class="watch-background"></div>
            
            ${renderHeader()}

            <main class="watch-content">
                ${renderProfile(data.photo)}
                ${renderInterests()}
            </main>
        </div>
    `;
  },
};
