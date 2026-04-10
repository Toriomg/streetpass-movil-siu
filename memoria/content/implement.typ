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

En el siguiente automata, se puede observar el funcionamiento y el cambio de pantallas en base a la interacción del usuario: 
#automaton((
  "Reloj": ("Info": none, "Perfil": none),
  "Perfil": ("Match": none),
  "Match": ("Conexión": none),
  "Conexión": (),
  "Info": ("Reloj": none),
))

Por otro lado, hemos diseñado interfaces para el movil. Esto se debe a que nuestra funcionalidad adicional es poder ver las personas con las que te has cruzado mientras tienes desactivada la aplicación (_el modo silencio_). De esta manera, al coger el telefono, puedes acceder mediante reconocimiento facial a las personas que no has visto con el reloj. 
#grid(
  columns: 2,
  align(center, image("../../docs/interfaces/movil_inicio.png", width: 45%)),
  align(center, image("../../docs/interfaces/movil_navegacion.png", width: 45%)),
  )

Como se puede ver, la interfaz es una réplica adaptada a otro dispositivo de la que encontramos en las interfaces principales del reloj. Como veremos a continuación, el uso será el mismo.

Otro apunte relevante, es que el soporte con explicaciones acerca del uso, getsos y funcionalidades de la aplicación se encontrarán en estas pantallas del movil, ya que resultan más simples y cómodas para el usuario. 

== Descripción y Justificación de las Interacciones Implementadas
Como ya hemos visto en el diseño de la interfaz, para nosotros, la funcionalidad y la comodidad del usuario cuando se haga uso de la aplicación es un pilar fundamental. 

Por ello, a continuación describiremos debidamente los gestos seleccionados para las diferentes funcionalidades presentadas por nuestra aplicación. 

Un apunte relevante sobre los gestos que se describen en esta sección se plantean de modo que el usuario tenga ccogido el teléfono desde el bolsillo del pantalón o cerca. De esta manera, el usuario puede hacer los gestos de manera discreta, como ya habiamos mencionado con anterioridad.

=== Navegación y selección. 
En nuestro caso, la navegación y la selección se produce de manera muy similar a la de otras aplicaciones de conocimiento de personas como _Tinder_, salvo que en este caso, se sustituye cuaquier interacción con la pantalla por un gesto. 

*La navegación*, consiste en el paso de personas cercanas, para ello, hemos decidido el movimiento del teléfono *hacia la derecha*. La selección, consiste en querer conectar con alguno de los usuarios tras navegar por ellos, por lo que la *selección* se hace con el movimiento del teléfono *hacia la izquierda*. Cualquier otra selección o confirmación, como cuando eliges confirmar una conexión realizada por otra persona, para acceder a su información de contacto. 

La selección de dichos gestos, a parte de por la facilidad, naturalidad y discrección de los mismos, se ha producido por sus similitud con otras aplicaciones del mismo tipo, como ya hemos mencionado al comienzo de la sección. Al ser una aplicación con gestos, entendemos que la fricción de uso es mayor, pues el usuario debe memorizar los gestos para su correcta utilización. Por ello, y con la intención de reducir la dificultad y el tiempo de aprendizaje del usuario, consideramos que hacerlo lo más similar posible a las opciones cotidianas y ya conocidas por los usuarios era vital para facilitar el uso y hacer la aplicación más atractiva a nuevos usuarios. 

Además, la decisión de hacer la navegación hacia la derecha y la selección hacia la izquierda se han tomado por comodidad gestual. Entendemos que hay una mayoría de personas distras respecto a zurdas, por lo que el usuario promedio será diestro. Para un usuario diestro, es más comodo hacer el movimiento a la derecha que a la izquierda, dado que se pasa más tiempo navegando que seleccionando, el gesto más comodo debe ser el mayoritario. 


=== Control de funcionalidades principales 
La idea con nuestra aplicación es que el usuario pueda conectar con otros usarios. Por ello, el usuario tiene que poder *conocer, conectar, aceptar solicitudes de conexión y rechazar solicitudes de conexion*. 

Para reducir el número de gestos, que es una cuestión que nos hemos propuesto de manera muy explicita durante el diseño de la aplicación para facilitar el aprendizaje de uso, el número de gestos nuevos que se asocian a estas acciones es muy bajo. 

- *Conocer* se corresponde con la navegación que hemos definido en el apartado anterior, es decir movimiento del teléfono hacia la *derecha*.
- Para *conectar* con alguien, también mantenemos el movimiento hacia la *izquierda*. 
- *La aceptación de solicitudes de conexión* se hará también con el gesto de conexión, *giro a la izquierda*, como si se tratara de una selección. De esta manera, se mantiene la misma intuición de _aceptar = movimiento izquierdo_ y se permite que el usuario no tenga que aprender muchos gestos. 
- De la misma manera, el gesto definido para *rechazar solicitudes* es el de navegación *hacia la derecha*, esencialmente, porque te devuelve a la navegación general de la aplicación, volviendo a mostrarte a las personas y a las pantallas y secciones principales de la aplicación. 

=== Salida o confirmación. - REPASAR !!!!!!!
Para salir completamente de la aplicación porque el usuario no quiere estar conectado, ni aparecer a otros usuarios hemos decidido que el gesto empleado sea *gesto*. De esta manera, aseguramos que la aplicación solo se cierra en caso de que el usuario quiera hacero y se evitan colisiones con el _modo bloqueo_ que se presentará a continuación. 

// ahora definimos mejor esto y cuando veamos bien los gestos hago imagenes y explico mejor los movimientos 

El flujo de uso de las funcionalidades principales es el que se muestra en el siguiente automata:

// automata del funconamiento total de las funcionalidades principales

=== Funcionalidaded adicionales
Además de lo indicado en el apartado anterior, hemos desarrollado tres funcionalidades adicionales que están planteadas para mejorar el uso o porque son cuestiones que, aunque no se plantearan en el proceso de ideación, nos parecía interesante añadir como posibles usuarios de una aplicación como la que estamos desarrollando. 

==== Bloqueo de usuarios 
Como en cualquier aplicación social en la que hay usuarios, debe haber una posibilidad de poder bloquear a usuarios a los que no quieres ver y que no quieres que te vean en la app. 

Para ello, hemos añadido un gesto de bloqueo como funcionalidad adicional a las principales de la aplicación. Cuando, mientras navegas por las personas cercanas, te aparece una persona a la que quieres bloquear, en vez de hacer el movimiento a derecha o a izquierda (navegación o selección) el movimiento que se realiza es hacia *arriba*. 

==== Modo bloqueo 
Entendemos que como usuarios no siempre vamos a querer estar pegados mirando el reloj pero eso no hace que no queramos seguir almacenando a gente con la que nos hemo cruzado o que ha estado en ambientes similares a los nuestros. Por ello, como nuestra principal funcionalidad adicional hemos desarrollado el _modo bloqueo_. 

El modo bloqueo permite que mientras el usuario no tiene el reloj se almacenen aquellas personas con las que se ha cruzado o que han estado cerca suyo y que tienen gustos similares a los suyos. Estas personas se almacenan y cuando el usuario coge su dispositivo móvil estas le aparecen en él y puede seguir realizando conexiones con ellas. 

Esta funcionalidad se decidió con la ayuda de nuestro profesor Roberto. El caso de uso más claro que nos imaginamos es el de un usuario que justo vuelve a casa y al subir al ascensor coge su teléfono movil y, de esta manera, puede ver a personas similares del sitio del que viene. Además, en nuestro caso, es algo muy cotidiano y natural volver de un sitio social o un plan y utilizar el móvil nada más llegar a casa o en el camino a casa. 

===== Gestos del modo bloqueo 
Los gestos, se mantienen muy similares. En cuanto a la activación del modo bloqueo, este se activa cuando se identifica que el reloj ha dejado de ser usado y mirado por el usuario. Es decir, cuando el usuario baja la mano, se activa el modo bloqueo a no ser que explicitamente el usuario decida salir completamente de la aplicación. 

Una vez activado el modo bloqueo, este se desactivará si el usuario vuelve a levantar el reloj. 

Las personas que se han almacenado se mostrarán usando reconocimiento facial si se identifica que el usuario ha levantado el telefono. 

En cuanto a mostrar las personas, los movimientos que se realizan son practicamente idénticos a los que se realizan con el reloj. Para cerrar la aplicación completamente y dejar de mostrar a las personas se *gesto*, para pasar personas y conectar con ellos se realizan exactamente los mismos gestos que hemos definido en el modo normal. 

Utilizamos los mismos gestos ya que estos facilitan enormemente el tiempo de aprendizaje de uso de la aplicación y hacen que el usuario tenga que realizar un esfuerzo menor por memorizarlos, pues sabemos que el número de cosas a memorizar para usar una aplicación es limitado. 

En el siguiente automata podemos ver el funcionamiento exacto del modo bloqueo. 

// automata para funcionamiento 

==== Recomendación de actividades
Además, se van a utilizar los gustos introducidos por los usuarios de modo que se pueda, además de enseñar a personas cercanas con gustos similares, mostrar lugares que puedan ser de interés para hacer planes. Ya sean museos, restaurantes, o cualquier sitio cercano que pueda interesar al usuario en base a sus gustos. 

Los sitios cercanos aparecerán del mismo modo que las personas y con ellos no puede hacerse nada más que la navegación normal. 

==== Ampliar rango de búsqueda de personas 
En muchas ocasiones, el usuario puede estar en un lugar muy concreto o con pocos usuarios. Para ello, hemos añadido una funcionalidad adicional en la que se permite al usuario ampliar el rango de búsqueda de personas cercanas, para salirle a personas que están más lejos y que a el le salgan personas también más lejanas. 

En nuestro caso hemos establecido que el rango radial de búsqueda del usuario sea de 2 metros, al ampliar el rango, se amplia al doble, 4 metros. En la siguiente imagen se puede ver el cambio de búsqueda de personas. 

// imagen del cambio de rango

Para dicho cambio, el gesto seleccionado es el de *agitar*. Hemos elegido este gesto porque entendemos que la apmpliación de rango no será un movimiento muy realizado al utilizar la aplicación. Agitar el teléfono es un movimiento más grande, incomodo y cansado, por lo que era bastante adecuado para esta funcionalidad completa. Al salir de la aplicación, el rango se reestablece, y la manera de volver a reducir el rango por parte del usuario es volver a agitar el teléfono. 

== Videos que Muestran el Prototipo en Funcionamiento
Los videos que demuestran el correcto funcionamiento de la aplicación y los gestos implementados se pueden encontrar en la siguiente lista de youtube: *aquí iría el link*

// nuestra solución final 