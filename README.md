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
├──  server
│   ├──  index.js
│   └──  socketEvents.js
├──  www
│   ├──  assets
│   │   ├──  fonts
│   │   │   ├──  SF-Compact-Display-Black.ttf
│   │   │   ├──  SF-Compact-Display-Bold.ttf
│   │   │   ├──  SF-Compact-Text-Medium.ttf
│   │   │   ├──  SF-Compact-Text-Regular.ttf
│   │   │   ├──  SF-Compact-Text-Semibold.ttf
│   │   │   └──  SF-Compact.ttf
│   │   ├──  icons
│   │   │   ├──  iconos
│   │   │   │   ├── 󰕙 armstrong.svg
│   │   │   │   ├── 󰕙 balance.svg
│   │   │   │   ├── 󰕙 bookback.svg
│   │   │   │   ├── 󰕙 christianity.svg
│   │   │   │   ├── 󰕙 dividedapplered.svg
│   │   │   │   ├── 󰕙 dog.svg
│   │   │   │   ├── 󰕙 horse.svg
│   │   │   │   ├── 󰕙 house.svg
│   │   │   │   ├── 󰕙 microprocessor.svg
│   │   │   │   ├── 󰕙 mountains3.svg
│   │   │   │   ├── 󰕙 moviefilm.svg
│   │   │   │   ├── 󰕙 musicnote.svg
│   │   │   │   ├── 󰕙 muslim.svg
│   │   │   │   ├── 󰕙 rocket.svg
│   │   │   │   └── 󰕙 xboxset2.svg
│   │   │   ├──  aguila.png
│   │   │   ├──  how.png
│   │   │   └──  supernova.png
│   │   ├──  mobile
│   │   │   └──  logo.png
│   │   └──  watch
│   │       └──  background.png
│   ├──  css
│   │   ├──  mobile
│   │   │   └──  base.css
│   │   ├──  watch
│   │   │   ├──  screens
│   │   │   │   ├──  connection.css
│   │   │   │   ├──  match.css
│   │   │   │   ├──  message.css
│   │   │   │   └──  profile.css
│   │   │   ├──  base.css
│   │   │   └──  header.css
│   │   ├──  global.css
│   │   ├──  mobile.css
│   │   └──  watch.css
│   ├──  js
│   │   ├──  core
│   │   │   ├──  socketManager.js
│   │   │   └──  uiRouter.js
│   │   ├──  modules
│   │   │   ├──  ui
│   │   │   │   ├──  baseUI.js
│   │   │   │   ├──  homeUI.js
│   │   │   │   └──  watchUI.js
│   │   │   └──  gestures.js
│   │   ├──  utils
│   │   │   ├──  clock.js
│   │   │   └──  format.js
│   │   └──  main.js
│   └──  index.html
├──  index.js
├──  package-lock.json
├──  package.json
└── 󰂺 README.md
```