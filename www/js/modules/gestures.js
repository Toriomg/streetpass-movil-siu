export function initGestures(socket) {
    const display = document.getElementById('data-display');
    const btn = document.getElementById('start-sensors');

    let lastTapTime = 0;
    let lastShakeTime = 0;
    let isCooldown = false;

    btn.onclick = () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(state => {
                if (state === 'granted') startListening();
            });
        } else {
            startListening();
        }
        btn.style.display = 'none';
    };

    function startListening() {
        console.log("Detectando gestos...");

        // EN BOLSILLO (Touch Events: 1 toque Aceptar, 2 Rechazar)
        document.addEventListener('touchstart', (e) => {
            const now = Date.now();
            const delta = now - lastTapTime;

            if (delta < 300 && delta > 0) {
                lastTapTime = 0;
                sendGesture("RECHAZAR ❌", "ui-reject");
            } else {
                lastTapTime = now;
                setTimeout(() => {
                    if (lastTapTime === now) {
                        sendGesture("ACEPTAR ✅", "ui-accept");
                    }
                }, 350);
            }
        });

        // EN MANO (Inclinación Izquierda/Derecha) LOS HE CAMBIADO POR QUE IBAN AL REVES XD
        window.addEventListener('deviceorientation', (event) => {
            if (isCooldown) return;
            const gamma = event.gamma;

            if (gamma > 35) {
                sendGesture("DERECHA 👉", "ui-nav", { dir: 'left' });
                activateCooldown(500); // Pausa de medio segundo entre navegaciones
            } else if (gamma < -35) {
                sendGesture("IZQUIERDA 👈", "ui-nav", { dir: 'right' });
                activateCooldown(500);
            }
        });

        // AGITAR y BAJAR BRAZO
        window.addEventListener('devicemotion', (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc || isCooldown) return;

            // --- Agitar ---
            const totalAcc = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
            if (totalAcc > 30) {
                sendGesture("MODO SILENCIO", "ui-silence");
                activateCooldown(2000); // 2 segundos de pausa tras agitar
            }

            // BAJAR BRAZO (AHORA MISMO VA CUANDO ESTÁ ARRIBA EN VEZ DE ABAJO :/)
            // Cuando bajas el brazo, el teléfono se pone vertical (Y positivo aumenta)
            // y el movimiento suele tener una aceleración hacia abajo clara
            if (acc.y > 9 && Math.abs(acc.x) < 2 && Math.abs(acc.z) < 3) {
                sendGesture("REPOSO", "ui-sleep");
                activateCooldown(3000);
            }
        });
    }

    // Función auxiliar para centralizar avisos y sockets
    let displayTimeout;

    function sendGesture(label, eventName, extraData = {}) {
        const display = document.getElementById('data-display');

        // Mostrar el gesto
        display.innerText = label;
        display.style.opacity = "1";
        console.log(`Gesto enviado: ${label}`);

        // Emitir al servidor
        if (socket) {
            socket.emit(eventName, extraData);
        }

        // Limpiar el temporizador anterior si existe (para que no se borre antes de tiempo si haces gestos rápidos)
        clearTimeout(displayTimeout);

        // Programar el borrado en 1 segundo
        displayTimeout = setTimeout(() => {
            display.innerText = "Esperando gesto...";
            display.style.opacity = "0.5"; // Lo ponemos un poco transparente para que sepa que está en espera
        }, 1000);
    }

    function activateCooldown(ms) {
        isCooldown = true;
        setTimeout(() => isCooldown = false, ms);
    }
}