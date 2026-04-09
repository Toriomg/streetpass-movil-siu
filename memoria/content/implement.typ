#import "@preview/finite:0.5.0": automaton

= Implementación de los Prototipos
Para la implementación de los prototipos, hemos tenido que pulir algunos de los aspectos presentados en al etapa de ideación y diseño, planteando diferentes opciones para los aspectos de nuestra aplicación, como son las interfaces del usuario, los gestos y las funcionalidades. 

Uno de lo factores claves que hemos tenido en cuenta a la hora de diseñar y plantear _Streetpass_ es el hecho de que es una aplicación cuyo uso es cotidiano y está planteada para usar en público, a diferencia de otras aplicaciones con un uso más específico. Esto, es un factor de gran relevancia ya que hemos adaptado los gestos, métodos de uso e interfaces de modo que sea lo más elegante y sencillo para usar por el usuario. Nuestra intención con las decisiones de implementación tomadas es precisamente que el usuario no sienta vergüenza, pudor o limitaciones a la hora de usar nuestra aplicación. 

Para conseguir dicho objetivo, hemos tenido que modificar ligeramente lo presentado en la entrega anterior en cuanto al uso de los dispositivos se refiere. De modo que la navegación y los movimientos puedan ser lo más discretos y cómodos posibles, hemos cambiado nuestra pantalla a que se presente en el _smartwatch_ y el sensor en el móvil del usuario. De este modo, los movimientos a realizar por el usuario pueden esconderse dentro de un bolsillo, bajo una chaqueta o hacerse de manera disimulada muy pegados al cuerpo. Y mientras estos movimientos se producen, la impresión es tan comoda y cotidiana como la de mirar la hora en un reloj. 

== Diseño de interfaz
Pese a que no se pide de manera explicita en las especificaciones de la práctica, consideramos relevante mencionar brevemente cuales han sido nuestras decisiones a la hora de diseñar las interfaces. 

A parte de basarnos en los principios de usabilidad modernos, hemos hecho que el uso de la aplicación sea lo más claro, visual y sencillo posible. 

=== Diseño pantalla (reloj)
En el modo normal, en el que el usuario pasa la mayor parte de su tiempo, el reloj es la pantalla principal. 

En general, hemos intenado mantener la interfaz lo más sencilla posible, manteniendo la hora, para dar más sencillez y hacer el uso de la aplicación algo más disimulado y útil. 

#grid(
  columns: 4,
  image("../../docs/interfaces/reloj_mensajes.png", width: 100%),
  image("../../docs/interfaces/reloj_principal.png", width: 100%),
  image("../../docs/interfaces/reloj_gustas.png", width: 100%),
  image("../../docs/interfaces/reloj_conexion.png", width: 100%),
)

Hemos intentado mantener una interfaz lo más sencilla y funcional posible, minimizando el texto y haciendo que la información relevante, como imagenes o texto aparezca lo suficientemente grande como para ser legible en un dispositivo pequeño como lo es un _smartwatch_. 

Por otro lado, hemos diseñado interfaces para el movil. Esto se debe a que nuestra funcionalidad adicional es poder ver las personas con las que te has cruzado mientras tienes desactivada la aplicación (_el modo silencio_). De esta manera, al coger el telefono, puedes acceder mediante reconocimiento facial a las personas que no has visto con el reloj. 
#grid(
  columns: 2,
  image("../../docs/interfaces/movil_inicio.png", width: 60%),
  image("../../docs/interfaces/movil_navegacion.png", width: 60%),
  )

Como se puede ver, la interfaz es una réplica adaptada a otro dispositivo de la que encontramos en las interfaces principales del reloj. Como veremos a continuación, el uso será el mismo.

== Descripción y Justificación de las Interacciones Implementadas

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