# To do List

Para cambiar los checks hay que hacerlo sin el preview. Desconozco una mejor manera

## 🟢 FASE 1: Cimientos y Arquitectura

- [x] **Estructura de Carpetas:** Verificar que el sistema modular está operativo.
  - [ ] Server
  - [x] WWW
  - [x] CSS
  - [x] JS
- [x] **Socket.io Rooms:** Implementar la lógica para que el servidor diferencie entre el "Reloj" y el "PC/Home" mediante salas específicas.
- [ ] **Router de Interfaz:** Tener el `uiRouter` funcionando para cambiar de pantalla sin recargar.
- [ ] **Sistema de Handshake por URL:** Implementar la captura del parámetro `userID` en la *url* del frontend para enviarlo al conectar.
- [ ] **Rooms Dinámicas:** Configurar `socket.join(userID)` para aislar el tráfico de datos entre diferentes alumnos/usuarios en tiempo real.
- [x] **Iconos e intereses:** Conseguir los iconos de los intereses disponibles

## 🔵 FASE 2: Interfaz Visual (UI/UX) - "El Look & Feel"

- [x] **Fuente SF Compact:** Configurar todos los pesos (Regular, Bold, Black) para que parezca un Apple Watch real.
- [x] **Componentes del Reloj:**
  - [x] Pantalla `Profile` (Navegación).
  - [x] Pantalla `Match` (Conoce a Noa).
  - [x] Pantalla `Connection` (Número de teléfono).
  - [x] Pantalla `Message` (Rango ampliado, modo silencio).
  - Más pantallas?
- [ ] **Interfaz de Usuario PC (Modo Casa):**
  - [ ] Sistema de "Pila" (Stack): Visualizar los encuentros del día en orden cronológico inverso.
  - Mas pantallas?
- [ ] **Botón de Soporte/Ayuda:** Implementar en ambas pantallas un botón `?` que despliegue un modal explicando los gestos (Muy importante para el profe).

## 🟡 FASE 3: Captura y Lógica de Gestos

- [ ] **Gestures.js (Modo Calle - Reloj):**
  - [ ] **En Bolsillo:** Implementar `touchstart` (1 toque: aceptar, 2 toques: rechazar).
  - [ ] **En Mano (Inclinación):** Detectar `deviceorientation` o `devicemotion` para el movimiento Izquierda/Derecha.
  - [ ] **Agitar (Shake):** Implementar el cambio de modo a "Silencio/Desconexión".
  - [ ] **Bajar brazo:** Detectar el cambio brusco de eje para cerrar la app o ponerla en reposo.
- [ ] **Gestures.js (Modo Casa - PC):**
  - [ ] **Face-API:** (Opcional/Extra) Integrar detección facial real con la webcam para el inicio de sesión.
  - [ ] **Gestos de mano:** Implementar el paso de tarjetas (tipo Tinder) usando inclinación del móvil como mando.

## 🟠 FASE 4: Funcionalidades Avanzadas

- [ ] **Lógica de Almacenamiento:** Crear una lista de "Encuentros perdidos" que se llene cuando el modo silencio esté activo.
- [ ] **Sistema de Bloqueo:** Implementar el "Bloqueo de perfiles" (añadir el ID de la persona a una lista negra para que no vuelva a aparecer).
- [ ] **Recomendación Ubicua:** Implementar notificaciones de "Restaurantes/Planes" cuando no hay personas cerca, basados en los gustos del usuario.
- [ ] **Ajuste de Rango:** Que el gesto de agitar fuerte en mano modifique una variable de "distancia de búsqueda" y lo notifique en pantalla.

## 🔴 FASE 5: Pulido y Animaciones

- [ ] **Lógica de Emparejamiento (Server):** Crear un objeto en `js/modules` que rastree parejas activas y evite que un tercer dispositivo use un ID ya ocupado por un sensor/reloj.
- [ ] **Transiciones CSS:** Asegurar que cada cambio de pantalla tenga su animación de entrada/salida (scale, fade, slide).
- [ ] **Feedback Háptico:** Usar `navigator.vibrate()` en el móvil para que vibre al recibir un Match o al realizar un gesto correctamente.
- [ ] **Audio:** Añadir sonidos sutiles de "blip" o notificaciones para reforzar la interacción.

## ⚪ FASE 6: Documentación y Entrega

- [ ] **Vídeo Demostrativo 1 (Escenario Calle):** Grabar el uso del móvil en el bolsillo (toques) y en la muñeca (reloj).
- [ ] **Vídeo Demostrativo 2 (Escenario Casa):** Mostrar el reconocimiento facial y la gestión de la pila de pendientes.
- [ ] **Memoria Técnica (15 págs máx):**
  - [ ] Diagrama de arquitectura (Node + Sockets + USB).
  - [ ] Justificación de los gestos elegidos (por qué el bolsillo, por qué la inclinación).
  - [ ] Explicación de los retos técnicos (latencia, sensores).
- [ ] **README.md:** Instrucciones claras de `npm install` y cómo configurar el `chrome://inspect`.
- [ ] **Prueba de Interferencia:** Documentar en el proceso experimental que dos parejas pueden usar el sistema simultáneamente sin que los gestos de una afecten a la otra.