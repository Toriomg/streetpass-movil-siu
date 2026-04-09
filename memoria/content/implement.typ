#import "@preview/finite:0.5.0": automaton

= Implementación de los Prototipos
#h(2.2em)El código desarrollado se encuentra en el siguiente repositorio de Github@repo. Donde se pueden consultar las contribuciones de cada miembro, en la programación (`www/`, `server/`), planeacion (`docs/diagramas`, `docs/interfaces`, `docs/planning.md`, ...) y redaccion de la memoria (`memoria/`).
== Descripción y Justificación de las Interacciones Implementadas
#h(2.2em)El diseño de la interfaz de usuario se realizó siguiendo principios de usabilidad modernos, como se puede observar en el prototipo@diseno_interfaz.




Las pantallas del reloj se componen de lo siguiente:
#automaton((
  "Reloj": ("Info": none, "Perfil": none),
  "Perfil": ("Match": none),
  "Match": ("Conexión": none),
  "Conexión": (),
  "Info": ("Reloj": none),
))
== Videos que Muestran el Prototipo en Funcionamiento