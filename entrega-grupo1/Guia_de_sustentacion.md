# Guía de sustentación del Grupo 1

## Presentación inicial

Nuestro módulo administra movimientos de inventario. Cada movimiento tiene un código de producto, un tipo, una cantidad y una fecha. El identificador lo asigna la base de datos. Desarrollamos el componente y el servicio Angular sobre la base con Bootstrap que suministró el profesor, usando el módulo de clientes como referencia.

El alcance es registrar y consultar operaciones. La API existente no actualiza automáticamente el stock de productos. Por eso llamamos al indicador “balance registrado”: suma las entradas y resta las salidas del historial.

## Demostración en siete minutos

### Minuto 1 Explicar la pantalla

Mostrar los cuatro registros originales. Explicar que hay 70 unidades de entrada, 7 de salida y un balance registrado de 63. Aclarar que los indicadores usan la lista completa; buscar un producto no cambia esos totales.

### Minuto 2 Mostrar búsqueda y filtros

Buscar `prod-001` en minúsculas. Deben aparecer sus movimientos. Elegir “Solo salidas” para combinar condiciones. Usar las fechas para limitar el historial. Invertir el rango para mostrar su validación y pulsar “Limpiar filtros”.

### Minuto 3 Registrar una entrada

Abrir “Nuevo movimiento”. Intentar guardar sin código y con cantidad cero para mostrar que la petición no se envía. Corregir los datos: usar un código de demostración único, tipo entrada, cantidad 12 y la fecha del día. Guardar. Mostrar el mensaje de confirmación y el nuevo registro. El código se presenta en mayúsculas.

### Minuto 4 Editar y comprobar persistencia

Editar exclusivamente el registro de demostración. Cambiarlo a salida de 3 unidades. Explicar que su ID se mantiene y la petición usa PUT. Recargar el navegador para demostrar que el dato fue guardado en H2 y no solamente en una variable del navegador.

### Minuto 5 Confirmar y cancelar un borrado

Abrir la eliminación del registro de demostración. Mostrar que la confirmación identifica el producto, la cantidad y la fecha. Primero pulsar “Conservar registro”. Volver a abrir y confirmar para limpiar únicamente el dato de demostración. Los cuatro registros iniciales deben seguir presentes.

### Minuto 6 Recorrer el código

Abrir el servicio y señalar GET, POST, PUT y DELETE. Abrir el componente y explicar `signal`, `computed`, el formulario reactivo y `guardar()`. Señalar la plantilla con `[formGroup]`, `formControlName`, `(ngSubmit)`, `@if` y `@for`.

### Minuto 7 Explicar diseño y pruebas

Mostrar cómo `row` y `col-6 col-xl-3` organizan las tarjetas y cómo `table-responsive` contiene la tabla en móvil. Los iconos provienen de `bi`. Presentar el informe de integración y las capturas. Explicar que los errores de red se probaron mediante simulación en un navegador de pruebas.

## Preguntas que puede hacer el profesor

### Qué hace cada uno de los cuatro archivos

El componente TypeScript coordina el estado, las validaciones, los filtros y los eventos. El HTML representa la interfaz y sus enlaces con el estado. El CSS ajusta la apariencia del módulo sobre Bootstrap. El servicio concentra las peticiones HTTP a la API.

### Por qué usar un servicio

Evita escribir URL y operaciones HTTP en la plantilla o repetirlas en cada evento. El componente decide cuándo ejecutar una operación; el servicio sabe cómo comunicarse con el backend. La inyección de dependencias permite que Angular suministre ese servicio y su `HttpClient`.

### Qué significa Observable y por qué hay subscribe

`HttpClient` devuelve un Observable. La petición se ejecuta al suscribirse. `next` atiende la respuesta satisfactoria y `error` maneja el fallo. En este módulo cada acción del usuario produce una suscripción a su petición; no hay una suscripción duplicada que cree dos registros.

### Por qué hay finalize

Restablece el indicador de carga cuando la petición termina, tanto si responde bien como si falla o se cancela. Así los botones no quedan bloqueados después de un error.

### Qué hace takeUntilDestroyed

Vincula la suscripción al ciclo de vida del componente. Si se abandona la pantalla, Angular cancela la suscripción pendiente. Las peticiones HTTP normalmente terminan solas; este operador también atiende el caso de una navegación antes de la respuesta.

### Qué es signal

Es un valor reactivo. `movimientos()` lo consulta; `movimientos.set(lista)` lo reemplaza; `movimientos.update(...)` calcula un nuevo valor a partir del anterior. Angular sabe qué partes de la vista dependen del signal y las actualiza.

### En qué se diferencia computed

`computed` deriva un valor de otros signals y vuelve a calcularlo cuando cambian. `entradas`, `salidas`, `balance`, `filtrados` y `visibles` no son copias independientes que debamos sincronizar manualmente.

### Por qué usar formularios reactivos

Definen los controles y sus validadores en TypeScript. `[formGroup]` conecta el formulario del HTML y `formControlName` conecta cada campo. Se puede revisar el estado de validez antes de llamar al servicio y mostrar mensajes después de que se toque un campo o se intente guardar.

### Qué significa nonNullable

Los controles se crean con valores de sus tipos concretos, como texto y número. Al restablecerlos no se convierten automáticamente en `null`. Esto ayuda al tipado y evita construir un objeto incompleto por un reinicio del formulario.

### Qué es Omit y por qué el formulario no tiene id

`DatosMovimiento = Omit<Movimiento, 'id'>` reutiliza la estructura del movimiento excluyendo su identificador. El servidor genera el ID al crear. Al editar, el ID se envía en la URL y los datos editables van en el cuerpo JSON.

### Cómo se decide entre crear y actualizar

`editandoId` vale `null` cuando el registro es nuevo y contiene el ID cuando se está editando. `guardar()` elige POST o PUT con esa condición. Al editar se usa el movimiento ya recibido en el listado para precargar el formulario.

### Por qué se usa map al editar y filter al eliminar

`map` recorre la lista y sustituye únicamente el elemento cuyo ID coincide. `filter` devuelve todos excepto el que se eliminó. Ambos producen un nuevo arreglo y facilitan que el signal notifique el cambio a la vista.

### Cuándo cambia el historial

Después de la respuesta satisfactoria del servidor. Si POST, PUT o DELETE falla, no se presenta un éxito ni se retira un registro del historial. El mensaje de error se muestra en el contexto de la acción y los controles vuelven a estar disponibles.

### Cómo se evitan envíos repetidos

`guardar()` regresa inmediatamente si `guardando()` ya es verdadero. Además, el botón y el conjunto de campos se desactivan durante la petición. El borrado usa el mismo criterio con `eliminando()`.

### Por qué no basta con min y type number

Los atributos del HTML ayudan al usuario, pero también hay validadores Angular. La cantidad debe ser un entero positivo y caber en el `Integer` de Java: el máximo es 2147483647. Se rechazan cero, valores negativos, decimales y valores superiores al límite.

### Cómo se valida una fecha

Se exige formato `AAAA-MM-DD`. Se construye una fecha y se comprueba que al convertirla de nuevo conserve el mismo día. Así se detectan fechas inexistentes. La fecha inicial usa el reloj local del navegador para evitar un cambio de día al convertir a UTC.

### Se pueden registrar movimientos de días anteriores o futuros

Sí. La base del profesor no define una restricción que prohíba fechas futuras. El módulo exige una fecha de calendario válida, sin inventar una regla de negocio adicional.

### Cómo funcionan los filtros por fecha

Las fechas se conservan en el formato ISO `AAAA-MM-DD`, cuyo orden alfabético coincide con su orden cronológico. Se comparan con los extremos del rango de forma inclusiva. Si el inicio supera el final, se avisa y no se presenta un resultado válido para ese rango.

### Por qué hay paginaActual además de pagina

`pagina` conserva la selección del usuario. `paginaActual` la limita al número de páginas que realmente existen. Si al eliminar se reduce el historial o al filtrar queda una sola página, no se intenta mostrar una página vacía que ya no existe.

### Qué hace track m.id

Permite que Angular identifique cada fila por un ID estable. Al modificar la lista puede conservar y actualizar los elementos correspondientes. Un índice de posición no representa la identidad del movimiento cuando hay filtros y cambios de orden.

### Por qué dialog y no una ventana modal controlada por Bootstrap

`showModal()` del navegador bloquea el fondo y administra el foco. La tecla Escape permite cancelar y al cerrar se devuelve el foco al control anterior. El módulo aprovecha las clases de Bootstrap para el aspecto del diálogo sin añadir otro mecanismo de apertura y cierre. Durante un envío se impide cerrar con Escape para no ocultar una operación pendiente.

### Los colores son suficientes para diferenciar entradas y salidas

No dependemos solo del color. Cada tipo también tiene texto e iconos de dirección. Los botones con solo icono incluyen `aria-label`, hay etiquetas asociadas a los campos y los errores usan mensajes visibles.

### Bootstrap hace que la página sea responsive automáticamente

Bootstrap aporta herramientas, pero hay que elegir las clases. Las tarjetas usan columnas de 6 de 12 en tamaños pequeños y 3 de 12 desde `xl`. Los controles del formulario se apilan en móvil. La tabla se desplaza dentro de `table-responsive`; no se eliminan sus columnas.

### El balance puede ser negativo

Sí, si las salidas registradas superan las entradas registradas. El historial no tiene un saldo inicial de existencias ni la API actualiza stock. Bloquear salidas por disponibilidad exigiría definir esa regla y aplicarla en el backend dentro de una transacción.

### Por qué no se selecciona un producto de una lista

La entidad suministrada guarda `productoCodigo` como texto y el ejemplo usa códigos como `PROD-001`. La API de productos tiene su propia estructura y no define esa relación. Mantuvimos el contrato recibido en vez de inventar una relación que no existe en el backend.

### Qué sucede si se reinicia el servidor

H2 está en memoria. Al reiniciar Spring Boot se reconstruye la base y se ejecuta `data.sql`. Recargar el navegador por sí solo no reinicia la base. Para persistencia duradera habría que configurar otra URL o base de datos, fuera del alcance de los cuatro archivos.

### Es segura la validación del frontend por sí sola

El frontend mejora la interacción, pero una llamada directa a la API puede omitirlo. La versión suministrada del backend no aplica todas estas reglas con Bean Validation. No afirmamos que la interfaz imponga seguridad al servidor.

### Por qué la API puede fallar al usar 127.0.0.1 en el navegador

El backend permite el origen `http://localhost:4200` mediante CORS. `http://127.0.0.1:4200` es otro origen. Por eso la demostración usa `localhost` y conserva los puertos 4200 y 8080.

### Se modificó el trabajo de otros grupos

Se desarrollaron los cuatro archivos de movimientos de inventario. La copia local también indica `lang="es"` en el HTML principal y fija `spring.sql.init.encoding=UTF-8` para cargar correctamente las tildes de los datos SQL. No se modificaron las entidades, controladores, servicios Java ni componentes de los otros módulos.

### Qué significa la advertencia de tamaño en build

La compilación genera correctamente los archivos de producción. La configuración del proyecto con Bootstrap incluye sus estilos, sus iconos y su bundle JavaScript en la carga inicial y supera la advertencia de 500 kB. El límite de error es 1 MB. El CSS del componente respeta su presupuesto. No se aumentaron los límites para ocultar el aviso.

### Qué hizo el grupo con la IA

La IA ayudó a producir y revisar el código, diseñar pruebas y redactar documentación, conforme al permiso del curso. La sustentación debe demostrar que comprendemos el contrato de la API, las validaciones, el manejo del estado y las limitaciones de la solución.

## Ensayo antes de entregar

Abrir el servicio y explicar las cuatro peticiones sin leer la guía. Después seguir un dato desde el input hasta H2 y de vuelta a la tabla. Repetir el recorrido al producir un error. Practicar por qué el balance no equivale al stock y por qué H2 pierde cambios al reiniciarse.

Revisar el ZIP final: debe tener exactamente cuatro entradas. Mantener los registros originales y usar únicamente un dato de demostración para crear, editar y eliminar.
