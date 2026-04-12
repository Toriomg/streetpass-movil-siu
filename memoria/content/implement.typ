#import "@preview/finite:0.5.0": automaton

= Implementación de los Prototipos
Para la implementación de los prototipos, se ha pulido algunos de los aspectos presentados en al etapa de ideación y diseño, planteando diferentes opciones para los aspectos de nuestra aplicación, como son las interfaces del usuario, los gestos y las funcionalidades. 

Uno de lo factores claves que se ha tenido en cuenta a la hora de diseñar y plantear _Streetpass_ es el hecho de que es una aplicación cuyo uso es cotidiano y está planteada para usar en público, a diferencia de otras aplicaciones con un uso más específico. Esto, es un factor de gran relevancia ya que hemos adaptado los gestos, métodos de uso e interfaces de modo que sea lo más elegante y sencillo para usar por el usuario. La intención con las decisiones de implementación tomadas es precisamente que el usuario no sienta vergüenza, pudor o limitaciones a la hora de usar nuestra aplicación. 

Para conseguir dicho objetivo, se ha tenido que modificar ligeramente lo presentado en la entrega anterior en cuanto al uso de los dispositivos se refiere. De modo que la navegación y los movimientos puedan ser lo más discretos y cómodos posibles, hemos cambiado nuestra pantalla a que se presente en el _smartwatch_ y el sensor en el móvil del usuario. De este modo, los movimientos a realizar por el usuario pueden esconderse dentro de un bolsillo, bajo una chaqueta o hacerse de manera disimulada muy pegados al cuerpo. Y mientras estos movimientos se producen, la impresión es tan cómoda y cotidiana como la de mirar la hora en un reloj. 

== Diseño de interfaz
Pese a que no se pide de manera explicita en las especificaciones de la práctica, se ha considerado relevante mencionar brevemente cuales han sido las decisiones a la hora de diseñar las interfaces. 

A parte de basarnos en los principios de usabilidad modernos, hemos hecho que el uso de la aplicación sea lo más claro, visual y sencillo posible. 

=== Diseño pantalla (reloj)
En el modo normal, en el que el usuario pasa la mayor parte de su tiempo, el reloj es la pantalla principal. 

En general, se ha intenado mantener la interfaz lo más sencilla posible, manteniendo la hora, para dar más sencillez y hacer el uso de la aplicación algo más disimulado y útil. 

#figure(

grid(
  columns: 4,
  image("../../docs/interfaces/reloj_mensajes.png", width: 100%),
  image("../../docs/interfaces/reloj_principal.png", width: 100%),
  image("../../docs/interfaces/reloj_gustas.png", width: 100%),
  image("../../docs/interfaces/reloj_conexion.png", width: 100%),
),
caption: "Prototipos de la interfaz del reloj."
)

Se ha tratado de mantener una interfaz lo más sencilla y funcional posible, minimizando el texto y haciendo que la información relevante, como imágenes o texto que aparezca lo suficientemente grande, como para ser legible en un dispositivo pequeño como lo es un _smartwatch_. 

En la @transiciones, se puede observar el funcionamiento y el cambio de pantallas en base a la interacción del usuario: 
#figure(
  automaton(
    final: none,
    (
      "Reloj": ("Info": none, "Perfil": none),
      "Info": ("Reloj": none),
      "Perfil": ("Match": none),
      "Match": ("Conex": none),
      "Conex": ("Reloj": none),
    ),
    layout: (
      "Reloj": (4,-1),
      "Info": (0,-1),
      "Perfil": (7,0),
      "Match": (10, -1),
      "Conex": (7, -2)
    ),
  ),
  caption: "Máquina de estados de la transición de pantallas del reloj."
)<transiciones>

Por otro lado, se han diseñadon interfaces para el móvil. Esto se debe a que nuestra funcionalidad adicional es poder ver las personas con las que te has cruzado mientras se tiene desactivada la aplicación, i.e. está el modo silencio activado. De esta manera, al coger el telefono, se puede acceder mediante reconocimiento facial a las personas que no se han contactado con el reloj. 

#figure(
  grid(
    columns: 2,
    align(center, image("../../docs/interfaces/movil_inicio.png", width: 45%)),
    align(center, image("../../docs/interfaces/movil_navegacion.png", width: 45%)),
  ),
  caption: "Prototipos de la interfaz del móvil."
)

Como se puede apreciar, la interfaz es una réplica adaptada a otro dispositivo de la que encontramos en las interfaces principales del reloj. Como se verá a continuación, el uso será el mismo.

Otro apunte relevante, es que el soporte con explicaciones acerca del uso, gestos y funcionalidades de la aplicación se encontrarán en estas pantallas del movil, ya que resultan más simples y cómodas para el usuario. 

== Descripción y Justificación de las Interacciones Implementadas
Como ya hemos visto en el diseño de la interfaz, para nosotros, la funcionalidad y la comodidad del usuario cuando se haga uso de la aplicación es un pilar fundamental. 

Por ello, a continuación describiremos debidamente los gestos seleccionados para las diferentes funcionalidades presentadas por nuestra aplicación. 

Un apunte relevante sobre los gestos que se describen en esta sección se plantean de modo que el usuario tenga ccogido el teléfono desde el bolsillo del pantalón o cerca. De esta manera, el usuario puede hacer los gestos de manera discreta, como ya habiamos mencionado con anterioridad.

=== Navegación y selección. 
En nuestro caso, la navegación y la selección se produce de manera muy similar a la de otras aplicaciones de conocimiento de personas como _Tinder_, salvo que en este caso, se sustituye cuaquier interacción con la pantalla por un gesto. 

*La navegación*, consiste en el paso de personas cercanas, para ello, hemos decidido el movimiento del teléfono *hacia la derecha*. La selección, consiste en querer conectar con alguno de los usuarios tras navegar por ellos, por lo que la *selección* se hace con el movimiento del teléfono *hacia la izquierda*. Cualquier otra selección o confirmación, como cuando eliges confirmar una conexión realizada por otra persona, para acceder a su información de contacto. 

La selección de dichos gestos, a parte de por la facilidad, naturalidad y discrección de los mismos, se ha producido por sus similitud con otras aplicaciones del mismo tipo, como ya hemos mencionado al comienzo de la sección. Al ser una aplicación con gestos, entendemos que la fricción de uso es mayor, pues el usuario debe memorizar los gestos para su correcta utilización. Por ello, y con la intención de reducir la dificultad y el tiempo de aprendizaje del usuario, se considera que hacerlo lo más similar posible a las opciones cotidianas y ya conocidas por los usuarios era vital para facilitar el uso y hacer la aplicación más atractiva a nuevos usuarios. 

Además, la decisión de hacer la navegación hacia la derecha y la selección hacia la izquierda se han tomado por comodidad gestual. Entendemos que hay una mayoría de personas distras respecto a zurdas, por lo que el usuario promedio será diestro. Para un usuario diestro, es más comodo hacer el movimiento a la derecha que a la izquierda, dado que se pasa más tiempo navegando que seleccionando, el gesto más comodo debe ser el mayoritario. 


=== Control de funcionalidades principales 
La idea de la aplicación es que el usuario pueda conectar con otros usuarios. Por ello, el usuario tiene que poder *conocer, conectar, aceptar solicitudes de conexión y rechazar solicitudes de conexion*. 

Con tal de reducir el número de gestos, cuestión que se ha propuesto de manera muy explícita durante el diseño de la aplicación. Con el fin de facilitar el aprendizaje de uso, el número de gestos nuevos que se asocian a estas acciones es muy bajo. Estos son los siguientes:

- *Conocer* se corresponde con la navegación que se ha definido en el apartado anterior, es decir movimiento del teléfono hacia la *derecha*.
- Para *conectar* con alguien, también mantenemos el movimiento hacia la *izquierda*. 
- *La aceptación de solicitudes de conexión* se hará también con el gesto de conexión, *giro a la izquierda*, como si se tratara de una selección. De esta manera, se mantiene la misma intuición de "_aceptar = movimiento izquierdo_" y se permite que el usuario no tenga que aprender muchos gestos. 
- De la misma manera, el gesto definido para *rechazar solicitudes* es el de navegación *hacia la derecha*, esencialmente, porque te devuelve a la navegación general de la aplicación, volviendo a mostrarte a las personas y a las pantallas y secciones principales de la aplicación. 

=== Salida o confirmación. 
Para salir completamente de la aplicación debido a que el usuario no busca estar conectado, ni aparecer a otros usuarios se ha planeado que el gesto empleado sea *dar dos golpes al teléfono*. De esta manera, aseguramos que la aplicación solo se cierra en caso de que el usuario quiera hacero y se evitan colisiones con el _modo bloqueo_ que se presentará a continuación. 

Es un gesto completamente diferenciado de los anteriores y esto hace que se eviten posibles errores y salidas no intencionadas por parte de los usuarios. Una cosa muy útil en una aplicación como es la nuestra. Además, es un gesto sencillo, comodo y que requiere de un esfuerzo muy bajo por parte del usuario. 


El flujo de uso de las funcionalidades principales es el que se muestra en la @total:

// automata del funconamiento total de las funcionalidades principales
#figure(
  automaton(
    final: ("Reloj",),
    (
      "Reloj": (
        "Perfil": "Abrir App", 
        "Info": "Ver mi Info"
      ),
      "Info": (
        "Reloj": "Doble golpe\n(Cerrar)\n "
      ),
      "Perfil": (
        "Perfil": "Gesto Der.\n(Pasar)\n ", 
        "Match": "Gesto Izq.\n(Conectar)\n ",
        "Reloj": "\nDoble golpe\n(Cerrar)"
      ),
      "Match": (
        "Conex": "\nConfirmar /\nRecibida",
        "Perfil": "\nGesto Der.\n(Cancelar)"
      ),
      "Conex": (
        "Reloj": "\nDoble golpe\n(Finalizar)",
        "Perfil": "\nGesto Der.\n(Volver)"
      ),
    ),
    layout: (
      "Reloj": (0, 0),
      "Info": (-4, -4),   // Movido abajo a la izquierda
      "Perfil": (7, 0),   // Mucho más espacio a la derecha
      "Match": (14, 0),   // Espacio extra para que el texto no choque
      "Conex": (7, -5),   // Bajado para evitar que la flecha a Reloj cruce Perfil
    ),
  ),
  caption: [Máquina de estados de las funcionalidades principales: Navegación, Conexión y Gestión de Perfiles.]
)<total>

=== Funcionalidaded adicionales
Además de lo indicado en el apartado anterior, se han desarrollado tres funcionalidades adicionales que están planteadas para mejorar el uso o porque son cuestiones que, aunque no se plantearan en el proceso de ideación, resultaban interesantes al añadir como posibles usuarios de una aplicación que se estaba desarrollando. 

==== Bloqueo de usuarios 
Como en cualquier aplicación social en la que hay usuarios, debe existir una posibilidad de poder bloquear a usuarios. A los que no se les quiere ver y no se les desea encontrarse en la aplicación. 

Para ello, se ha añadido un gesto de bloqueo como funcionalidad adicional a las principales de la aplicación. Cuando, mientras se navega por las personas cercanas, aparece una persona a la que se le quiere bloquear, en vez de hacer el movimiento a derecha o a izquierda, i.e. navegación o selección, el movimiento que se realiza es hacia *arriba*. 

==== Modo bloqueo 
Se entiende que los usuarios no siempre querrán estar el reloj. Sin embargo, eso no hace que no quiera seguir almacenando a gente con la que uno se ha encontrado, o que haya estado en ambientes similares. Por ello, como nuestra principal funcionalidad adicional hemos desarrollado el "Modo Bloqueo". 

El "Modo Bloqueo" permite que mientras el usuario no tenga el reloj activado, se almacenen aquellas personas con las que se ha cruzado, o que hayan estado cerca, y que estos tengan gustos similares a los suyos. Estos usuarios se almacenan hasta que el usuario utiliza la aplicación móvil, estos usuarios le aparecerán en él. Pudiendo así seguir realizando conexiones con ellas. 

Esta funcionalidad se decidió con la ayuda del Prof. Roberto Cuervo. Siendo así, un escenario de uso claro que se ha planteado: el de un usuario que vuelve a casa y al subir al ascensor coge su teléfono movil y, de esta manera, se puede ver a personas similares del sitio del que uno viene. Además, en nuestro caso, es algo muy cotidiano y natural volver de un sitio social o un plan y utilizar el móvil al llegar a casa o en el trayecto a esta. 

===== Gestos del modo bloqueo 
Los gestos se mantienen muy similares. En cuanto a la activación del modo bloqueo, este se activa cuando se identifica que el reloj ha dejado de ser usado u observado por el usuario. Es decir, cuando el usuario baja la mano, se activa el modo bloqueo a no ser que explicitamente el usuario decida salir de la aplicación. 

Una vez activado el modo bloqueo, este se desactivará si y solo si el usuario vuelve a levantar el reloj. 

Asimismo, las personas que se han almacenado se mostrarán usando reconocimiento facial si se identifica que el usuario ha levantado el telefono. 

En cuanto a mostrar las personas, los movimientos que se realizan son practicamente idénticos a los que se realizan con el reloj. Para cerrar la aplicación completamente y dejar de mostrar a las personas se *gesto*, para pasar personas y conectar con ellos se realizan exactamente los mismos gestos que hemos definido en el modo normal. 

Se utilizan los mismos gestos, debido a que estos facilitan enormemente el tiempo de aprendizaje de uso de la aplicación y ahorrando al usuario el esfuerzo de memorizarlos, al ser este número de acciones limitado en el usuario.  

En la @bloquo se puede ver el funcionamiento exacto del modo bloqueo. 

#figure(
  automaton(
    final: ("Reloj",),
    (
      "Bloqueo": ("Identif": "Levantar brazo"),
      "Identif": ("Perfil": "Reconoc.\nFacial OK\n "),
      "Perfil": (
        "Perfil": "Gesto: Pasar", 
        "Match": "Gesto: Conectar", 
        "Bloqueo": "Bajar brazo"
      ),
      "Match": ("Conex": "Vincular"),
      "Conex": ("Reloj": "Finalizar"),
      "Reloj": ("Bloqueo": "Bajar brazo /\nInactividad\n"),
    ),
    layout: (
      "Bloqueo": (0, 0),
      "Identif": (4, 0), // Aumentado de 2 a 4
      "Perfil": (8, 0),  // Aumentado de 4 a 8
      "Match": (8, -3),  // Bajado a -3 para dar aire
      "Conex": (4, -3),
      "Reloj": (0, -3),
    ),
  ),
  caption: [Máquina de estados del funcionamiento en modo bloqueo y transición a perfiles.]
)<bloquo>

==== Recomendación de actividades
Asimismo, se utilizarán los gustos introducidos por los usuarios de modo que se pueda, además de enseñar a personas cercanas con gustos similares, mostrar lugares que puedan ser de interés para hacer planes. Sean estos: museos, restaurantes, o cualquier sitio cercano que pueda interesar al usuario en base a sus gustos. 

Los sitios cercanos aparecerán del mismo modo que las personas y con ellos no puede hacerse nada más que la navegación normal. 

==== Ampliar rango de búsqueda de personas 
En muchas ocasiones, el usuario puede estar en un lugar muy concreto o con pocos usuarios. Para ello, hemos añadido una funcionalidad adicional en la que se permite al usuario ampliar el rango de búsqueda de personas cercanas, para salirle a personas que están más lejos y que a el le salgan personas también más lejanas. 

En nuestro caso hemos establecido que el rango radial de búsqueda del usuario sea de 2 metros, al ampliar el rango, se amplia al doble, 4 metros. En la siguiente imagen se puede ver el cambio de búsqueda de personas. 

#figure(
  image("../diagramas/arquitectura.png"),
  caption: "Cambio de rango de búsqueda."
)

Para dicho cambio, el gesto seleccionado es el de *agitar*. Hemos elegido este gesto porque entendemos que la apmpliación de rango no será un movimiento muy realizado al utilizar la aplicación. Agitar el teléfono es un movimiento más grande, incomodo y cansado, por lo que era bastante adecuado para esta funcionalidad completa. Al salir de la aplicación, el rango se reestablece, y la manera de volver a reducir el rango por parte del usuario es volver a agitar el teléfono. 

== Videos que Muestran el Prototipo en Funcionamiento
Los videos que demuestran el correcto funcionamiento de la aplicación y los gestos implementados se pueden encontrar en la siguiente lista de youtube:

// nuestra solución final 
#sym.arrow.r *aquí iría el link*