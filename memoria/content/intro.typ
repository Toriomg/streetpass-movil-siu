= Introducción
En el documento actual se *documenta el proceso de prototipado del Sistema de _Streetpass_.* Realizado para el trabajo de la asignatura de Sistemas Interactivos y Ubicuos. Para ello, se explicarán los diferentes procesos llevados a cabo para su desarrollo. De las especificaciones técnicas para realizar el prototipo, a la justificación de las interacciones implementadas. Con su siguiente experimentación e iteración del proceso, hasta llegar al prototipo final.

== Detalles de inicio y uso del prototipo final.
Para el uso de la aplicación desarrollada, se han de seguir los siguientes pasos: 

=== Servidor
Estando en el directorio del proyecto `streetpass-movil-siu/`, se debe ejecutar el servidor con el siguiente mandato:

```Bash
node server/index.js
```


=== _Frontends_
Una correcta inicialización del servidor devolvería:

```Bash
==========================================
Servidor corriendo en:
Movil:
http://localhost:3000/?user=101&v=home
Reloj:
http://localhost:3000/?user=101&v=watch
-> en chrome://inspect con Port Forwarding
==========================================
```

En tales ejemplos, se muestra como correr los distintos _frontends_ del proyecto. La distinción de estos consiste en el uso de los parámetros de la _url_. Donde `v=home` es para el "Modo Móvil" y `v=watch` es para el "Modo Reloj". 

El otro argumento que compone la _url_ es el de `user`. Es importante que ambas instancias corran bajo el mismo `user` en la _url_ para sincronizarlas. Aunque no es profundamente relevante, se recomienda usar identificadores de usuarios en el rango de: $[101,110]$. Dado que estos usuarios están especificados en el registro de usuarios de `mockUsers.json`, de otro modo el usuario será parcialmente aleatorio.