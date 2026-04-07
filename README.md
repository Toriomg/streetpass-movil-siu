# Instrucciones de ejecucion

teneis que correr npm para que los node modules salgan

## Ejecutar el server

1.  **En el PC (Terminal):** Ejecuta desde `streetpass-movil-siu/`: `node server/index.js`
2.  **En el PC (Navegador):** Abre `http://localhost:3000?v=pc`. Esto será tu "Modo Casa".
3.  **En el Móvil (USB):**
    *   Conecta por cable.
    *   En `chrome://inspect/#devices`, activa Port Forwarding `3000 -> localhost:3000`.
    *   Abre en el móvil: `http://localhost:3000?v=reloj`.
4.  **La prueba:**
    *   Mueve el móvil bruscamente (agitar) o inclínalo.
    *   Verás que el "reloj" en el móvil reacciona y el PC (que está en la misma URL pero en modo casa) podría recibir la lista de personas.

## Estructura (temporal):

```text
/streetpass-siu
├── server/                         (Lógica del Backend)
│   ├── index.js                    (Entrada Express)
│   └── socketEvents.js             (Lógica de Socket.io separada)
├── www/                            (Frontend - lo que sirve Node)
│   ├── assets/                     (Imágenes, sonidos, iconos)
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── mobile/
│   │   └── watch/
│   ├── css/
│   │   ├── global.css              (Variables, tipografías, reset)
│   │   ├── watch.css               (Interfaz del Reloj/Móvil)
│   │   │   ├── screens       
│   │   │   └── mas cosas       
│   │   └── home.css                (Interfaz de Casa/PC)
│   ├── js/
│   │   ├── core/
│   │   │   ├── socketManager.js    (Manejo de conexión)
│   │   │   └── uiRouter.js         (Lógica para cambiar de pantallas)
│   │   ├── modules/
│   │   │   ├── ui/
│   │   │   │   ├── baseUI.js       (Interfaces padres)
│   │   │   │   ├── watchUI.js      (interfaz del Reloj)
│   │   │   │   └── homeUI.js       (interfaz del PC/Reconocimiento Facial)
│   │   │   └── gestures.js         (Captura de acelerómetro/giroscopio)
│   │   └── main.js                 (Punto de entrada del JS)
│   └── index.html                  (Un solo HTML base "SPA")
├── package.json
└── .gitignore
```