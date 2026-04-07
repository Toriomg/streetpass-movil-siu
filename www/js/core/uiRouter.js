// www/js/core/uiRouter.js

export class UIRouter {
  constructor() {
    this.activeInterface = null;
    this.history = [];
  }

  /**
   * Configura qué interfaz vamos a usar (WatchUI o HomeUI)
   * @param {BaseUI} interfaceInstance
   */
  setInterface(interfaceInstance) {
    this.activeInterface = interfaceInstance;
  }

  /**
   * Cambia la pantalla actual
   * @param {string} viewType El nombre de la vista (ej: 'match', 'profile', 'pila')
   * @param {Object} data Los datos necesarios para esa vista
   */
  navigate(viewType, data = {}) {
    if (!this.activeInterface) {
      console.error("UIRouter: No hay ninguna interfaz activa configurada.");
      return;
    }

    console.log(`Navegando a: ${viewType}`);

    // Guardamos en el historial para poder volver atrás si fuera necesario
    this.history.push({ viewType, data });

    // Todas las interfaces (WatchUI, HomeUI) deben tener este método render
    this.activeInterface.render(data, viewType);
  }

  /**
   * Vuelve a la pantalla anterior
   */
  back() {
    if (this.history.length > 1) {
      this.history.pop(); // Eliminamos la actual
      const previous = this.history.pop(); // Recuperamos la anterior
      this.navigate(previous.viewType, previous.data);
    }
  }
}

// Exportamos una instancia única (Singleton)
export const uiRouter = new UIRouter();
