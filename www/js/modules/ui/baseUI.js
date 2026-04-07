export class BaseUI {
  constructor(container) {
    // Acepta tanto un ID en string como un elemento del DOM ya seleccionado
    if (typeof container === "string") {
      this.container = document.getElementById(container);
    } else {
      this.container = container;
    }

    if (!this.container) {
      console.error("BaseUI: No se ha encontrado el contenedor principal.");
    }
  }

  /**
   * Método principal que inyecta el HTML en el contenedor.
   * Lo usarán las clases hijas para pintar sus pantallas.
   */
  renderTemplate(htmlContent) {
    if (!this.container) return;

    // Aquí en el futuro podrías añadir transiciones CSS de entrada/salida
    // ej: this.container.classList.add('fade-in');

    this.container.innerHTML = htmlContent;
  }

  /**
   * Limpia el contenedor por completo.
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }

  /**
   * Utilidad para añadir eventos fácilmente a botones o elementos
   * de la interfaz recién renderizados.
   */
  addEvent(selector, eventType, callback) {
    const element = this.container.querySelector(selector);
    if (element) {
      element.addEventListener(eventType, callback);
    } else {
      console.warn(
        `BaseUI: Elemento ${selector} no encontrado para añadir evento.`,
      );
    }
  }

  /**
   * Funcionalidad común: El botón de ayuda/soporte (TODO List Fase 2)
   * Cualquier interfaz que herede de BaseUI podrá llamar a esto.
   */
  renderHelpButton(helpText) {
    const helpBtn = document.createElement("button");
    helpBtn.className = "global-help-btn"; // Necesitarás darle estilos en tu CSS
    helpBtn.innerText = "?";

    helpBtn.addEventListener("click", () => {
      // De momento un alert, luego puede ser un Modal
      alert(helpText);
    });

    this.container.appendChild(helpBtn);
  }
}
