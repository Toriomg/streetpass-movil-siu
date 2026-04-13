# Streetpass — Sistema de comunicación interpersonal ubicua

Sistemas Interactivos y Ubicuos 2025/26 · Grupo 81 · Equipo 14  
Héctor Molina · Noa López · Guillermo González

---

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Un PC/TV con navegador (pantalla del reloj)
- Un smartphone con Chrome (sensor y pantalla secundaria)
- Cable USB o red local compartida para conectar el móvil

---

## Instalación y arranque

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Arrancar el servidor
node server/index.js
```

El servidor confirmará que está corriendo en `http://localhost:3000`.

---

## Cómo abrir cada dispositivo

El sistema usa dos vistas distintas según el parámetro `v` de la URL.  
El parámetro `user` indica qué perfil usa ese dispositivo (ver IDs en `server/data/mockUsers.json`).

| Dispositivo | URL | Quién la abre |
|---|---|---|
| Reloj (pantalla principal) | `http://localhost:3000/?user=101&v=watch` | PC o TV |
| Móvil (sensor + pantalla secundaria) | `http://localhost:3000/?user=101&v=home` | Smartphone |

> Ambos deben usar el **mismo `user`** para estar en la misma sesión.

### Conectar el móvil por USB (recomendado para los sensores)

1. Conecta el móvil por cable USB al PC.
2. Abre `chrome://inspect/#devices` en Chrome del PC.
3. Activa **Port Forwarding**: `3000 → localhost:3000`.
4. Abre en el navegador del móvil: `http://localhost:3000/?user=101&v=home`

### Conectar el móvil por red local (alternativa)

1. Averigua la IP del PC en la red (`ip a` o `ipconfig`).
2. Abre en el móvil: `http://[IP-DEL-PC]:3000/?user=101&v=home`

---

## Cómo probar el sistema paso a paso

### Flujo principal (modo activo)

1. Abre el reloj en el PC → verás la cara del reloj con la hora.
2. Abre el móvil → verás la pantalla de **Modo Sensor Activo**.
3. En el móvil, pulsa **"Activar Sensores"** (panel negro arriba) para dar permiso a los sensores.
4. En el reloj, pulsa **"Simular persona cercana"** (panel negro arriba) → aparece el perfil de una persona.
5. Usa los gestos del móvil para interactuar (ver tabla abajo).
6. Al inclinar a la izquierda (conectar), el reloj muestra la pantalla de **Match** y tras 5 segundos el **teléfono de contacto**.
7. Al inclinar a la derecha (pasar), el reloj pide automáticamente la siguiente persona.

### Flujo modo bloqueo

1. Con el sistema activo, **baja el brazo** sostenidamente → el reloj muestra "Modo bloqueo activo" y el móvil cambia a pantalla de bloqueo.
2. **Sube el brazo suavemente** → vuelve al modo activo.
3. **Saca el teléfono del bolsillo con un movimiento brusco hacia arriba** → el móvil muestra la pila de personas vistas durante el modo bloqueo.
4. Navega por ellas con gestos de inclinación; **baja el teléfono** para volver al modo bloqueo.

---

## Gestos implementados

Todos los gestos se realizan con el **móvil**. El reloj solo muestra.

| Gesto | Acción | Cuándo |
|---|---|---|
| Inclinar derecha | Pasar / siguiente persona | Modo activo y pila |
| Inclinar izquierda | Conectar / aceptar solicitud | Modo activo y pila |
| Inclinar hacia arriba (pantalla al techo) | Bloquear usuario actual | Modo activo y pila |
| Doble toque en pantalla | Cerrar aplicación | Cualquier estado |
| Agitar | Ampliar rango de búsqueda | Modo activo |
| Bajar brazo (sostenido) | Activar modo bloqueo | Modo activo |
| Subir brazo (suave) | Volver al modo activo | Modo bloqueo |
| Sacar teléfono del bolsillo (brusco) | Ver pila de personas | Modo bloqueo |
| Bajar teléfono | Volver al modo bloqueo | Viendo la pila |

---

## Funcionalidades implementadas

- **Navegar y seleccionar**: paso entre personas mediante inclinación del móvil
- **Control de funciones principales**: conectar, aceptar y rechazar solicitudes
- **Salida / confirmación**: doble toque cierra la app desde cualquier estado
- **Bloqueo de usuarios**: gesto de inclinar arriba durante la navegación
- **Modo bloqueo**: sistema sigue recogiendo personas mientras el reloj está guardado
- **Recomendación de actividades**: el móvil sugiere planes según los gustos del usuario cuando no hay personas cerca
- **Ampliar rango de búsqueda**: agitar el teléfono amplía el radio de detección
- **Geolocalización**: el móvil puede mostrar las coordenadas GPS actuales del usuario
- **Comunicación en tiempo real**: todo sincronizado vía Socket.IO entre reloj y móvil

---

## Estructura del proyecto

```
streetpass-movil-siu/
├── server/
│   ├── index.js          # Arranque del servidor Express
│   ├── socketEvents.js   # Máquina de estados de gestos (Socket.IO)
│   ├── dataManager.js    # Lectura/escritura de datos JSON
│   └── data/
│       ├── mockUsers.json     # Perfiles de usuario simulados
│       ├── encounters.json    # Historial de conexiones
│       ├── blocked.json       # Usuarios bloqueados
│       └── profiles.json      # Perfiles guardados
├── www/
│   ├── index.html        # Punto de entrada único para ambas vistas
│   ├── js/
│   │   ├── main.js           # Lógica principal: inicializa reloj o móvil
│   │   ├── core/
│   │   │   ├── socketManager.js  # Cliente Socket.IO (singleton)
│   │   │   └── uiRouter.js       # Enrutador de vistas
│   │   ├── modules/
│   │   │   ├── gestures.js       # Captura de gestos (motion + orientation)
│   │   │   └── ui/
│   │   │       ├── watchUI.js    # Vistas del reloj
│   │   │       ├── mobileUI.js   # Vistas del móvil
│   │   │       └── baseUI.js     # Clase base compartida
│   │   └── utils/
│   │       ├── clock.js          # Reloj digital en tiempo real
│   │       └── format.js         # Formateado de teléfonos
│   ├── css/
│   │   ├── global.css
│   │   ├── watch.css
│   │   └── mobile.css
│   └── assets/           # Imágenes, iconos y fuentes
├── package.json
└── README.md
```

---

## Pendientes

### Código — bugs y mejoras necesarias

- **Indicadores visuales de la pila invertidos** — `mobileUI.js:47-49` muestra
  `"← Rechazar | Aceptar →"`, pero el gesto real es inclinar a la **izquierda** para aceptar
  y a la **derecha** para pasar (`gestures.js:76-82`). O bien se corrige el texto, o se
  cambia el mapping del swipe táctil (`mobileUI.js:261-265`) para que sea coherente.

- **Modo bloqueo no acumula personas** — durante el modo `sleep` el servidor sí puede
  disparar `user:nearby:trigger`, pero nadie llama a `saveEncounter` mientras `socket.mode`
  es `"sleep"`. Al abrir la pila (`stack-open`) solo aparecen conexiones ya aceptadas
  previamente, no personas "vistas de lejos". Hay que guardar automáticamente el encuentro
  en el servidor cuando llega un `user:nearby` y el modo es `sleep`.

- **`package.json` sin script `start`** — para arrancar el proyecto hay que recordar
  `node server/index.js`. Añadir `"start": "node server/index.js"` en los scripts facilita
  tanto la entrega como el README exigido por el enunciado.


- **Botón de ayuda `?` con los gestos** — el TODO.md y el enunciado lo mencionan
  explícitamente ("muy importante para el profe"). Falta un botón en ambas pantallas
  (reloj y móvil) que abra un modal con la tabla de gestos.

- **Feedback háptico** — no hay ninguna llamada a `navigator.vibrate()`. Añadir vibración
  al recibir un match y al reconocer un gesto mejora la experiencia y sube la nota en la
  rúbrica de interacción.

- **Transiciones CSS entre pantallas** — cada llamada a `uiRouter.navigate()` sustituye el
  DOM sin animación. Añadir un fade o scale en `baseUI.js` hace la demo mucho más fluida.

- **Reconocimiento facial (FaceAPI) no implementado** — la memoria lo cita en §3.1.2 como
  mecanismo para identificar que el usuario ha sacado el teléfono del bolsillo y mostrar la
  pila. Actualmente se sustituye por el gesto de tirón brusco hacia arriba, lo que es
  funcional, pero la memoria queda incoherente. O se implementa o se actualiza el texto
  de la memoria para eliminar esa referencia.

### TODO DESARROLLO 
- [] Visión en movil de las personas almacenadas en el modo bloqueo - MUY IMPORTANTE 
- Ampliar rango de búsequeda de personas agitando - MUY IMPORTANTE 
- [] Botón de soporte con gestos - MUY IMPORTANTE (que lo mencionó en clase que era esencial)
- [] Corrección del acceso al modo bloqueo y salida del modo bloqueo con un toque ????
- [] Corrección de la entrada a la aplicación con dos toques 
- [] Ver lo del reconocimiento facial y si no simularlo para ver a las personas almacenadas en modo bloqueo - SI NO DA TIEMPO LO QUITAMOS 

### VIDEOS A GRABAR
1. Video con la versión inicial de la entrega anterior en la que se hacian los gestos con el brazo del reloj y se miraban en el movil 
2. Video en el que probamos diferentes gestos para diferentes cosas como conexiones y tal - esto hay que ver como lo trucamos sin tener que picar código o picando código realmente 
3. Video de la implementación final

---

## TODO ACTUALIZADO (2026-04-13)

Comparado el estado real del código con los pendientes anteriores. Estado de cada punto:

### CÓDIGO — Bugs críticos (bloquean funcionalidad demostrable)

- [ ] **[BUG] Pila modo bloqueo vacía** (`server/socketEvents.js`)
  La pila nunca acumula personas durante `sleep`. El trigger llega al servidor pero no llama a `saveEncounter` cuando `socket.mode === "sleep"`. Al abrir la pila con `stack-open` siempre aparece vacío.
  → Hay que guardar el usuario en `saveEncounter` cuando llega `user:nearby:trigger` y el modo es `sleep`.

- [ ] **[BUG] Gesto "bloquear usuario" (inclinar arriba / beta) no implementado** (`www/js/modules/gestures.js`)
  La guía de gestos lo anuncia pero el listener de `deviceorientation` solo comprueba `gamma` (izquierda/derecha). El `beta` para inclinar hacia arriba nunca se evalúa. El bloqueo solo funciona por el botón de la UI del reloj.

- [ ] **[BUG] Indicadores de la pila invertidos** (`www/js/modules/ui/mobileUI.js:47-49`)
  Muestra `"← Rechazar | Aceptar →"` pero el gesto real es izquierda = aceptar, derecha = pasar. Hay que invertir el texto (o el mapping del swipe táctil en línea 261-265).

### CÓDIGO — Pendientes del TODO anterior

- [x] **Ampliar rango agitando** — YA IMPLEMENTADO. El gesto `shake` está en `gestures.js` y el servidor lo gestiona correctamente.
- [ ] **Botón de ayuda `?` con tabla de gestos** — MUY IMPORTANTE (lo mencionó el profesor). Falta en ambas pantallas (reloj y móvil).
- [ ] **Acceso/salida modo bloqueo con un toque** — Actualmente se usa movimiento de brazo (funciona). La memoria describe "un toque" como activador. Decidir si se unifica o se deja el gesto de brazo (más elegante) y se actualiza la memoria en consecuencia.
- [ ] **Entrada a la aplicación con dos toques** — El doble toque actualmente solo hace `exit` (cierra). No hay gesto de "abrir" desde estado cerrado, hay que volver a recargar la página. Valorar si interesa arreglarlo o simplemente documentarlo así en la memoria.
- [ ] **Reconocimiento facial** — No implementado. La memoria lo menciona en §3.1.2. DECISIÓN: eliminarlo de la memoria y documentar que se sustituye por el gesto de tirón brusco (que sí funciona).

### CÓDIGO — Mejoras de calidad (suben nota en la rúbrica de interacción)

- [ ] **Feedback háptico** (`navigator.vibrate()`) al recibir match y al reconocer gesto de aceptar. Hay un log de intento en `gestures.js:87-90` pero nunca se ejecuta porque está dentro del condicional de `canVibrate` que no llega a dispararse bien fuera del accept. Revisar y añadir también en shake y match.
- [ ] **Transiciones CSS entre pantallas** — `uiRouter.navigate()` sustituye el DOM sin animación. Un fade/scale en `baseUI.js` hace la demo mucho más fluida.
- [ ] **Script `start` en `package.json`** — Añadir `"start": "node server/index.js"` para poder hacer `npm start`.
- [ ] **Descripción en `package.json`** — Cambiar `"No sé aún no he hecho nada. :)"` por algo real antes de entregar el zip.

### MEMORIA — Secciones con placeholders (penalizan directamente)

- [ ] **§1.1** — Reemplazar el placeholder *"aqui incluis como se inicia y todas las historietas..."* con el flujo de uso real (está en el README.md, se puede adaptar).
- [ ] **§2.2** — Rellenar tecnologías 3, 4 y 5 (Gestos: DeviceOrientation/Motion API; Reconocimiento facial: eliminarlo o decir que se descartó; Localización: Geolocation API).
- [ ] **§3.3** — Insertar links de YouTube de los vídeos de demostración (pendiente de grabar).
- [ ] **§4.1** — Insertar links de los vídeos de sesiones 1 y 2 (pendiente de grabar).
- [ ] **§5.1** — Reemplazar *"aqui poned problemas durante el desarrollo"* con los problemas técnicos reales (ya documentados en la sección "Pendientes" de este README y en el análisis).
- [ ] **§5.2** — Insertar el link al vídeo comparativo de gestos originales vs. finales.
- [ ] **§6 — Reflexión sobre IA** — **VACÍA. Penalización -0.3 garantizada si se entrega así.** Hay que escribirla antes de entregar.

### VÍDEOS A GRABAR (sin cambios respecto al TODO anterior)

- [ ] Vídeo 1: versión inicial (gestos con brazo del reloj mirando el móvil)
- [ ] Vídeo 2: sesión de prueba de diferentes gestos (puede ser una grabación corta del equipo probando)
- [ ] Vídeo 3: implementación final en funcionamiento (flujo completo: modo activo → match → modo bloqueo → pila)

