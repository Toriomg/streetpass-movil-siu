# STREETPASS MOVIL SIU 
Sistema de streetpass entre personas con el movil para la Asignatura Sistemas Interactivos y Ubicuos de la Uc3m

## Ideas generales 
- **ARQUITECTURA:**
	- *PANTALLA:*
		- pantalla del móvil
	- *DISPOSITIVO DE INTERACCIÓN:*
		- reloj inteligente
	- *SERVIDOR:*
    
    apuntes del profe: para la demostración tenemos que usar el movil como reloj y simularlo poniendolo en la muñecha (pero tenemos que hacer que tenga forma de reloj para que funcione) y podemo simular el movil en el portatil o un ipad o algo así pero en la simulación tiene que estar ambos

- **FUNCIONALIDADES:**
	- Navegación y selección espacial
	- Control de funciones principales
		- Recomendación de personas con gustos similares
			- Aceptar, avisar, rechazar/descartar, notificar
		- Modificación de rango de distancias para las recomendaciones
		- Introducción de gustos y experiencias para poder emparejar con otras personas
	- Salida o confirmación
	- *EXTRAS:*
		- Bloqueo de personas
			- Rechazar ciertas cosas
			- Gestión de ordenes de alejamiento (o incluso aviso de si alguien está cerca)
			- Bloqueo de personas y aviso cuando están cerca
		- Recomendación de sitios en base a tus gustos en base a distancia (cuando pasas por ellos)
			- Recomendación de restaurantes cercanos
			- Recomendación de sitios concurridos donde conocer personas
		- Gestión de amigos para avisos aunque ellos no tengan gustos similares
			- Almacenamiento y posibilidad de lanzar solicitudes de amistad
			- Gestión de notificaciones cuando estos amigos están cerca

    apuntes del profe: tenemos que hacer una especie de modo por ejemplo a la que llegas a casa que tenga como otros movimientos y otras cosas diferentes o pensar n una idea en ese sentido, para que sea un modo de uso completamente diferente con otros gestos y otras historias 

## Cosas que hablamos con el profe 
- para la demostración tenemos que usar el movil como reloj y simularlo poniendolo en la muñecha (pero tenemos que hacer que tenga forma de reloj para que funcione) y podemo simular el movil en el portatil o un ipad o algo así pero en la simulación tiene que estar ambos

- tenemos que hacer una especie de modo por ejemplo a la que llegas a casa que tenga como otros movimientos y otras cosas diferentes o pensar n una idea en ese sentido, para que sea un modo de uso completamente diferente con otros gestos y otras historias 

- definir bien los gestos y las posiciones 

- opciones de añadir reconocimiento facial para añadir nuevas funcionalidades (como la de llegar a casa te reconoce la cara y con gestos ya puedes elegir a personas que has pasado por la calle y que no has tenido en cuenta) 
    - en esto también opciones de pasar con la mano 

- poner opciones de no querer conectar con la gente y luego ver como se gestionan todo eso

## Gestion de sesiones

Para gestionar múltiples parejas de dispositivos (Reloj $j$ vinculado a Móvil $i$) en un mismo servidor, la técnica estándar es el **Pairing por ID de Sesión** mediante **Salas de Socket.io (Rooms)**.

### Concepto de Gestión $n$ a $m$
1.  **ID de Pareja (PairID):** Cada usuario (persona) genera un código único (ej: `user_123`).
2.  **Identificación Dual:** 
    *   El Móvil $i$ se conecta con: `?user=123&v=sensor`.
    *   El Reloj $j$ se conecta con: `?user=123&v=watch`.
3.  **Aislamiento en Servidor:** El servidor crea una "habitación" privada para el `user_123`. Todo gesto enviado por el móvil en esa sala solo será escuchado por el reloj en esa misma sala.

## Gestion de usuarios

### 1. El "Perfil Propio" (Tus datos)
Es la información que tu móvil envía a los demás.
*   **Dónde los cambias:** Lo ideal es crear una **Pantalla de Ajustes/Perfil** en la interfaz del PC (`v=home`). Al ser una pantalla grande, es más cómodo escribir tu nombre y elegir tus gustos ahí.
*   **Dónde los guardas:** En el server?

### 2. Los "Usuarios Cercanos" (Mock Data)
* Guardamos las cosas en un users.json o una sqLite? de los datos los usuarios.
```bash
TABLE user:
	id uint;
	name/username: str,
	foto: url al server? la guardamos ahi?
	telefono: number 9 digitos
	gustos/intereses: str[3] # Guardamos strng y ya y hardcodeamos los tipos en el frontend
```
*   **Cómo funcionan ???:** El servidor de Node.js elige uno al azar de esa lista cada X tiempo y se lo envía al Reloj para simular que "te has cruzado con alguien".

### 3. La "Lista de Encuentros" (Historial)
Son las personas con las que ya te has cruzado y que has aceptado o guardado para ver luego en casa.
*   **Dónde los guardas:** En el **Servidor (Node.js)**. Es mejor guardarlos aquí porque si cierras el navegador del móvil, no quieres perder la lista de gente con la que te has cruzado durante el día.
*   **Persistencia:** Si quieres que sea un trabajo de 10, puedes hacer que el servidor guarde esa lista en un archivo de texto o JSON cada vez que hay un nuevo encuentro. Así, aunque apagues el PC, la "pila" de personas pendientes sigue ahí cuando lo vuelvas a encender.

### Resumen de flujo de datos:
1.  **Configuración:** Entras al PC -> Rellenas tu perfil -> Se guarda en el server?.
2.  **Uso:** Vas por la calle -> El servidor te manda un usuario del archivo `users.json` -> El Reloj lo muestra.
3.  **Acción:** Haces el gesto de "Aceptar" -> El Reloj avisa al Servidor -> El Servidor guarda a esa persona en tu "Lista de amigos".
4.  **Consulta:** Llegas a casa -> Abres el PC -> El PC le pide al Servidor tu lista de amigos guardada -> Se muestran todos en la pantalla grande.