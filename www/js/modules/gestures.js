// gestures.js
export class GestureManager {
  constructor(onGesture) {
    this.onGesture = onGesture;
    this.init();
  }

  init() {
    window.addEventListener("devicemotion", (e) => {
      const acc = e.accelerationIncludingGravity;
      // Lógica para detectar "Agitar"
      if (Math.abs(acc.x) > 15) {
        this.onGesture({ type: "SHAKE", side: acc.x > 0 ? "LEFT" : "RIGHT" });
      }
    });

    window.addEventListener("click", () => this.onGesture({ type: "TAP" }));
  }
}
