// js/modules/homeUI.js

export class HomeUI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pendingStack = []; // Aquí guardaremos los usuarios
  }

  renderBase() {
    this.container.innerHTML = `
            <div class="home-layout">
                <header class="home-header">
                    <h1>Modo Casa</h1>
                    <p>Encuentros mientras estabas desconectado/silenciado.</p>
                </header>
                <main class="stack-container" id="stack-container">
                    <!-- Las tarjetas irán aquí -->
                </main>
                <div class="controls-hint">
                    Usa tu móvil como mando (Inclinación Izq/Der) para clasificar.
                </div>
            </div>
        `;
  }

  // Cargar la lista que nos manda el servidor al conectar
  loadStack(users) {
    this.pendingStack = users;
    this.updateStackView();
  }

  updateStackView() {
    const stackContainer = document.getElementById("stack-container");
    if (!stackContainer) return;

    if (this.pendingStack.length === 0) {
      stackContainer.innerHTML = `<div class="empty-state">No hay encuentros nuevos.</div>`;
      return;
    }

    // Renderizar el usuario que está "encima" de la pila (el primero del array)
    const topUser = this.pendingStack[0];

    stackContainer.innerHTML = `
            <div class="profile-card slide-in">
                <img src="${topUser.foto || "assets/default.png"}" alt="Foto de ${topUser.name}">
                <h2>${topUser.name}</h2>
                <div class="interests">
                    ${topUser.gustos.map((g) => `<span class="badge">${g}</span>`).join("")}
                </div>
            </div>
        `;
  }

  // Se llama cuando recibimos un evento de socket desde el móvil (El mando)
  processGesture(action) {
    if (this.pendingStack.length === 0) return;

    const processedUser = this.pendingStack.shift(); // Sacamos al usuario de la pila

    if (action === "accept") {
      console.log(`Has aceptado a ${processedUser.name}`);
      // Aquí puedes lanzar animación hacia la izquierda/derecha
    } else if (action === "reject") {
      console.log(`Has rechazado a ${processedUser.name}`);
    } else if (action === "close") {
      console.log("Señal de cerrar sesión. Modo Casa apagado.");
      this.pendingStack = [];
    }

    // Actualizamos la UI con el siguiente
    this.updateStackView();
  }
}
