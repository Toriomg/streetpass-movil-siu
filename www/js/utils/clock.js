export const startClock = () => {
  const timeElement = document.getElementById("watch-time");

  const update = () => {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");
    if (timeElement) {
      timeElement.textContent = `${horas}:${minutos}`;
    }
  };

  update(); // Actualiza de inmediato
  setInterval(update, 1000); // Actualiza cada segundo o cada minuto
};
