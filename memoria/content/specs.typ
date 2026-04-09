= Especificaciones Técnicas
//#h(2.2em)
== Arquitectura del Sistema
#h(2.2em)La arquitectura del sistema consiste en un _backend_ que conecta a dos tipos de _frontend_: el correspondiente al reloj y el correspondiente al móvil. Tal como se ve en el la @arquitectura.

#figure(
  image("../diagramas/arquitectura.svg", width: 30%),
  caption: [Diagrama de componentes de la arquitectura.]
) <arquitectura>

#h(2.2em)A nivel conceptual el código del proyecto se distribuye como se muestra en la @conceptual. 

#figure(
  image("../diagramas/arquitectura.svg", width: 30%),
  caption: [Diagrama de componentes de la arquitectura.]
) <conceptual>

#h(2.2em)A nadie le gusta trabajar, les da alergia. 

== Tecnologías Utilizadas
#h(2.2em)Las tecnologías utilizadas en esta práctica son las siguientes:

1. *Servidor*: Para el servidor se ha utilizado *Express* y *NodeJS*.
2. *Conectividad*: Para conectar el _frontend_ con el _backend_ se ha utilizado *SocketIO*
3. *Gestos*: 