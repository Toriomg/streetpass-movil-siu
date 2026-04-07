#import "@preview/finite:0.5.0": automaton

= Implementación de los Prototipos
El código desarrollado se encuentra en el siguiente repositorio de Github.@repo
== Descripción y Justificación de las Interacciones Implementadas
El diseño de la interfaz de usuario se realizó siguiendo principios de usabilidad modernos, como se puede observar en el prototipo@diseno_interfaz.
Las pantallas del reloj se componen de lo siguiente:
#automaton((
  "Reloj": ("Info": none, "Perfil": none),
  "Perfil": ("Match": none),
  "Match": ("Conexión": none),
  "Conexión": (),
  "Info": ("Reloj": none),
))
== Videos que Muestran el Prototipo en Funcionamiento