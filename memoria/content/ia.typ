= Uso y Reflexión sobre Inteligencia Artificial Generativa
== Herramientas Utilizadas
En el desarrollo de este proyecto se integraron las siguientes herramientas de Inteligencia Artificial Generativa, en adelante IAG:

+ *Claude Code (Claude Opus 4.6)*: Se usó el agente de Anthopic, mediante la terminal, para codificar ágilemente grandes cantidades de código complejo, p. ej.: el uso de los gestos. 
+ *Github Copilot (Raptor Mini Preview)*: Se empleó el agente gratuito del editor _VsCode_ para tareas de corrección de _bugs_ sencillos.
+ *Gemini (3 Flash/3.1 Pro Preview)*: Se usó Gemini para el análisis de código y redacción de requisitos.

== Áreas de Aplicación
La IAG se empleó de manera estratégica en las siguientes fases del ciclo de vida del software:

-   *Generación de _Boilerplate_*: Creación de estructuras repetitivas y configuración inicial de archivos al iniciar el proyecto..
-   *Depuración:* Apoyo en la interpretación de trazas de error de JavaScript en la terminal del navegador y propuestas de solución a los errores.
-   *Documentación:* Redacción técnica de documentos de tipo Markdown, redactando: listados de tareas, archivos `Readme` y hojas de ruta a seguir.

== Validación y Supervisión Humana
Es importante destacar que ningún fragmento de código generado por IA fue integrado sin una revisión previa. El proceso de validación consistió en:

-  *Pruebas Unitarias:* Todo código sugerido fue supervisado y auditado sobre los cambios que estos provocarían en la ejecución.
-  *Ajuste de Contexto:* Se modificaron las sugerencias de la IA para adaptarlas al enfoque del prototipo.
-  *Verificación de Sesgos/Errores:* Se identificaron y corrigieron "alucinaciones" o sugerencias incoherentes proporcionadas por los modelos.

== Reflexión Crítica
El uso de IAG en este proyecto ha permitido una mayor agilidad en tareas mecánicas, permitiendo a los autores enfocarse en la toma de decisiones arquitectónicas y de diseño. 

Sin embargo, se reconoce que la dependencia excesiva de estas herramientas puede mitigar el aprendizaje profundo de la sintaxis o derivar en código redundante. Por ello, se mantuvo un enfoque de "IA como asistente, no como autor" en el desarrollo del código, garantizando que la autoría intelectual y la responsabilidad del funcionamiento final del software recaigan enteramente en los autores.