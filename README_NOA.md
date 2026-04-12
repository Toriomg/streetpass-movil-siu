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

## IDs de usuario disponibles para pruebas

| ID | Nombre | Intereses |
|---|---|---|
| 101 | Noa | Música, Películas, Derecho |
| 102 | Alejandra | Gimnasio, Senderismo, Dieta |
| 103 | Sara | Videojuegos, Películas, Lectura |
| 104 | Martina | Gimnasio, Películas, Ecologismo |
| 105 | Valeria | Electrónica, Películas, Ajedrez |

Para simular dos usuarios distintos en la misma red, abre el reloj con `user=101` y el móvil con `user=102`.
