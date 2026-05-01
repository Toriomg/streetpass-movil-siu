# Streetpass Móvil

Aplicación de encuentros por proximidad. El **reloj** (watch) muestra los perfiles y el **móvil** actúa como mando de gestos.

## Arrancar

```bash
npm install
node server/index.js
```

## Abrir

| Dispositivo | URL |
|-------------|-----|
| Reloj (PC) | `http://localhost:3000/?user=101&v=watch` |
| Móvil | `http://<IP-local>:3000/?user=101&v=home` |

Para encontrar tu IP local: `ip a` (Linux/Mac) o `ipconfig` (Windows).

**Alternativa con cable USB (Android):**
1. Conecta el móvil por USB
2. Abre `chrome://inspect` → Port Forwarding → añade `3000 → localhost:3000`
3. En el móvil abre `http://localhost:3000/?user=101&v=home`

## Gestos (móvil)

| Gesto | Acción |
|-------|--------|
| Inclinar izquierda | Conectar |
| Inclinar derecha | Pasar |
| Agitar | Bloquear usuario |
| Bajar brazo | Modo bloqueo |
| Subir brazo (suave) | Volver a activo |
| 1 toque | Ampliar rango |
| 2 toques | Activar / ver lista de modo bloqueo |
| 3 toques | Cerrar / abrir app |
