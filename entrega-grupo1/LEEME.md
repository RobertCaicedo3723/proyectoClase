# Movimientos de inventario del Grupo 1

La entrega desarrolla el módulo asignado al Grupo 1 sobre la carpeta con Bootstrap que suministró el profesor. Permite consultar, crear, editar y eliminar movimientos mediante la API existente de Spring Boot.

## Qué entregar

**Grupo1_MovimientosInventario.zip** contiene exactamente los cuatro archivos solicitados en la consigna:

1. `inventario-movimiento-component.ts`
2. `inventario-movimiento-component.html`
3. `inventario-movimiento-component.css`
4. `inventario-movimiento-service.ts`

El informe PDF, la guía de sustentación, el código explicado y las capturas son material de apoyo. `Grupo1_Entrega_Completa.zip` reúne ese material y el ZIP de cuatro archivos. No incluye `node_modules`, instaladores, cachés ni archivos de otros grupos.

## Dónde está el proyecto

La carpeta de trabajo es la raíz de este repositorio.

El backend está en `proyectoFinal`. El frontend está en `proyectoFinal/web/proyecto-app-front`.

La entrega se desarrolló sobre la base con Bootstrap suministrada por el profesor.

## Ejecutar desde IntelliJ y VS Code

1. En IntelliJ, abrir `proyectoFinal/pom.xml` como proyecto Maven. Usar Java 17, que ya dejó configurado el profesor.
2. Abrir `src/main/java/co/uis/proyecto/ProyectoApplication.java` y pulsar el botón de ejecución de `main`. Esperar el mensaje de inicio de Tomcat en el puerto 8080.
3. En VS Code, abrir `proyectoFinal/web/proyecto-app-front`.
4. En la terminal de esa carpeta, ejecutar `npm start`. En el equipo actual las dependencias ya están instaladas. Para instalar en otro equipo, ejecutar antes `npm ci`.
5. Abrir [el módulo de inventario](http://localhost:4200/movimientosInventario).

Si los puertos ya están en uso por las aplicaciones que dejó abiertas el profesor, usar esos procesos. No iniciar una segunda copia.

La API se consulta en [movimientos de inventario](http://localhost:8080/api/inventario-movimientos) y se puede explorar en [Swagger](http://localhost:8080/swagger-ui.html).

Para verificar el frontend, ejecutar `npm run build` desde su carpeta. La compilación genera el paquete de producción. La inclusión global de Bootstrap e iconos en la base suministrada produce un aviso por superar 500 kB iniciales; no supera el límite de error de 1 MB. No se cambiaron esos límites.

El archivo de prueba JUnit del backend no tiene sus dependencias declaradas en el POM de la base. La ejecución directa de `main` en IntelliJ funciona. Si se prefiere Maven desde consola, configurar Java 17 y ejecutar `./mvnw.cmd -Dmaven.test.skip=true spring-boot:run`. Ese comando arranca la aplicación sin compilar la prueba de ejemplo; no significa que se hayan ejecutado las pruebas Java. La verificación entregada corresponde al módulo Angular y a su integración HTTP.

## Integrar los cuatro archivos

Copiar el TypeScript, HTML y CSS del componente en:

`proyectoFinal/web/proyecto-app-front/src/app/componentes/inventario-movimiento-component/`

Copiar el servicio en:

`proyectoFinal/web/proyecto-app-front/src/app/services/`

La base del profesor ya tiene la ruta `movimientosInventario`, `provideHttpClient()`, Bootstrap 5.3.8 y Bootstrap Icons 1.13.1 configurados. No se necesita crear otra ruta ni instalar una biblioteca adicional para este módulo.

Además de los cuatro archivos, se corrigió el idioma de `src/index.html` de `en` a `es` en la copia local para que las herramientas de accesibilidad reconozcan el español. El módulo funciona con los cuatro archivos del ZIP; ese cambio de metadatos no es una dependencia funcional. También se añadió `spring.sql.init.encoding=UTF-8` en `proyectoFinal/src/main/resources/application.properties` para conservar las tildes al cargar `data.sql` en cualquier codificación predeterminada de Java.

## Qué estudiar

- `Informe_Grupo1.pdf`: arquitectura, datos, uso, validaciones, pruebas y límites del módulo.
- `Guia_de_sustentacion.md`: recorrido de demostración y preguntas con respuestas.
- `Codigo_explicado.html`: los cuatro archivos completos, con números de línea y explicaciones. Se abre sin conexión en un navegador. Permite buscar y filtrar por archivo.
- `capturas/`: evidencias reales del escritorio, filtros, formulario, validaciones, edición, confirmación de borrado, error controlado y vista móvil.
- `evidencias/`: resultados de las pruebas y de la compilación. Los fallos de conexión usados en pruebas se simularon en el navegador de pruebas; no se alteró la API del profesor.

## Comportamiento que debe explicarse con precisión

- Los indicadores resumen todos los registros recibidos. Los filtros y la paginación solo cambian el historial visible.
- La cantidad debe ser un entero entre 1 y 2147483647. El tipo solo puede ser `ENTRADA` o `SALIDA`.
- El código admite letras, números, guion y guion bajo, con máximo de 40 caracteres. Se guarda en mayúsculas.
- La fecha debe existir en el calendario y se envía como `AAAA-MM-DD`.
- El ID lo genera el servidor. Al crear no se envía un ID.
- El historial se modifica después de recibir una respuesta satisfactoria de la API.
- Si una petición falla, se informa el problema y se conserva el formulario para poder reintentar.
- **El backend suministrado registra movimientos, pero no actualiza el stock de productos ni relaciona el código con una clave foránea.** El balance mostrado es entradas menos salidas del historial; no representa existencias disponibles.
- H2 está configurado en memoria. Recargar el navegador conserva los datos mientras Spring Boot sigue activo. Reiniciar Spring Boot recrea la base y carga los datos de `data.sql`.
- Las validaciones implementadas corresponden al frontend. La lógica de validación Java del profesor no se modificó; una llamada directa a la API puede omitir esas reglas.

## Herramientas y asistencia

Se utilizaron Angular, TypeScript, formularios reactivos, signals, RxJS, Bootstrap e iconos de Bootstrap. Spring Boot, JPA y H2 pertenecen a la base suministrada. Se usó asistencia de IA para desarrollar, revisar y documentar el módulo, según la autorización del curso.

La evaluación depende de la rúbrica del profesor y de que el grupo comprenda y pueda demostrar el código.
