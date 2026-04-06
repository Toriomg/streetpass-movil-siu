# Instrucciones de ejecucion

teneis que correr npm para que los node modules salgan

## Ejecutar el server

1.  **En el PC (Terminal):** Ejecuta desde `streetpass-movil-siu/`: `node index.js`
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
/streetpass-project
├── index.js              (Servidor Node)
├── package.json
└── www/                  (Carpeta pública)
    ├── index.html        (HTML único con lógica dual)
    ├── style.css         (Diseño redondo para el reloj)
    └── script.js         (Lógica de gestos y Sockets)
```