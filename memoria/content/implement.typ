#import "@preview/finite:0.5.0": automaton

= Implementación de los Prototipos
#h(2.2em)El diseño de la interfaz de usuario se realizó siguiendo principios de usabilidad modernos, como se puede observar en el prototipo@diseno_interfaz.
== Descripción y Justificación de las Interacciones Implementadas
// Aqui explica lo de los gestos y las features que se ahn pensado meter
=== Recomendación de personas con gustos similares
=== Lo del tinder que ns como se llama
=== Funcionalidaded adicionales
#h(2.2em) A continuación, se desarrollarán las funcionalidades adicionales implementadas.
==== Bloqueo de Personas
==== Recomendación de sitios concurridos para conocer personas
==== Gestión de Amigos

// Luego explica como se divide las pantallas y como funciona el programa
Las pantallas del reloj se componen de lo siguiente:
#automaton((
  "Reloj": ("Info": none, "Perfil": none),
  "Perfil": ("Match": none),
  "Match": ("Conexión": none),
  "Conexión": (),
  "Info": ("Reloj": none),
))
== Videos que Muestran el Prototipo en Funcionamiento
#h(2.2em)Los correspondientes vídeos realizados demostrando el correcto funcionamiento del prototipo creado se encuentran en Youtube@videos_yutu1.