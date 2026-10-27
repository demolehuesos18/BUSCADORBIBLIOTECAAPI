
# 📚 Biblioteca del Campus

## 1. Descripción del proyecto

Biblioteca del Campus es una aplicación web diseñada para gestionar y consultar un catálogo de libros. Permite visualizar los libros registrados, buscar títulos en una API pública, consultar información bibliográfica, guardar favoritos y administrar la disponibilidad de los ejemplares registrados localmente.

El proyecto se desarrolla utilizando HTML, CSS y JavaScript, con almacenamiento de datos en el navegador para conservar información entre sesiones.

## 2. Objetivos

### Objetivo general

Desarrollar una aplicación web para la consulta y gestión de libros mediante una interfaz intuitiva, el consumo de una API REST y el uso de mecanismos de almacenamiento del navegador.

### Objetivos específicos

- Crear una interfaz web adaptable a diferentes dispositivos.
- Mostrar y filtrar los libros del catálogo local.
- Consumir una API pública mediante solicitudes HTTP.
- Procesar respuestas JSON de forma asíncrona.
- Implementar estados de carga, error y resultados vacíos.
- Guardar información utilizando `localStorage`.
- Implementar funciones para prestar ejemplares y administrar favoritos.
- Incorporar un modo oscuro para mejorar la experiencia de usuario.

## 3. Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de las páginas web. |
| CSS3 | Diseño visual y adaptación a dispositivos. |
| JavaScript | Lógica, eventos y manipulación del DOM. |
| Fetch API | Realización de solicitudes HTTP. |
| Open Library API | Consulta de información de libros. |
| localStorage | Persistencia de datos en el navegador. |
| JSON | Intercambio y almacenamiento de información estructurada. |

## 4. API pública utilizada

El proyecto utiliza **Open Library API**, un servicio público que permite consultar información bibliográfica de libros.

**Endpoint principal:**

https://openlibrary.org/search.json

**Método HTTP:** GET.

**Ejemplo de consulta:**

https://openlibrary.org/search.json?q=harry+potter&page=1&limit=10

### Parámetros utilizados

- `q`: término de búsqueda, como el título o autor.
- `page`: número de página de los resultados.
- `limit`: cantidad de resultados solicitados por página.

### Funcionamiento

1. El usuario introduce un título o autor.
2. JavaScript construye la URL con los parámetros de búsqueda.
3. Se realiza una solicitud HTTP utilizando `fetch()`.
4. La aplicación verifica la respuesta del servidor.
5. Los datos JSON se procesan mediante JavaScript.
6. Los resultados se muestran en tarjetas dentro de la interfaz.

La aplicación contempla estados de carga, errores de conexión y búsquedas sin resultados.

La API se utiliza para consultar libros; las operaciones de préstamo y eliminación del catálogo local se gestionan en el navegador.

## 5. Funcionalidades principales

### Catálogo local

- Visualización de libros registrados.
- Búsqueda por título o información disponible.
- Filtrado por categoría.
- Registro de libros.
- Préstamo de ejemplares disponibles.
- Devolución de ejemplares prestados.
- Actualización automática de la disponibilidad.

### Búsqueda mediante API

- Consulta de libros en Open Library.
- Visualización de información bibliográfica.
- Consulta de portadas cuando están disponibles.
- Navegación entre páginas de resultados.
- Manejo de errores y resultados vacíos.

### Favoritos

- Guardar libros encontrados mediante la API.
- Consultar los libros favoritos.
- Eliminar libros de la lista de favoritos.

### Inicio de sesión

- Las páginas del sistema requieren iniciar sesión (`login.html`).
- Usuario: `ADMIN` — Contraseña: `1234`.
- El botón "Cerrar sesión" termina la sesión y vuelve al login.

### Inicio

- Resumen con títulos, ejemplares disponibles/prestados, préstamos, devoluciones y favoritos.
- Accesos rápidos al catálogo, registro, búsqueda en Open Library y favoritos.

### Preferencias

- Activar o desactivar el modo oscuro.
- Guardar la preferencia visual en el navegador.

## 6. Almacenamiento en el navegador

La aplicación utiliza `localStorage` para conservar datos entre recargas y visitas posteriores desde el mismo navegador y origen.

Las claves utilizadas por la implementación incluyen:

| Clave | Información |
|---|---|
| `catalogo` | Libros registrados y disponibilidad local. |
| `prestamos` | Contador de préstamos registrados. |
| `devoluciones` | Contador de devoluciones registradas. |
| `favoritosAPI` | Libros guardados como favoritos. |
| `cacheOpenLibrary` | Resultados de consultas a la API para reutilizarlos temporalmente. |
| `modo` | Preferencia de apariencia clara u oscura. |
| `usuarioActivo` | Indicador local de sesión iniciada (no guarda la contraseña). |

### Métodos de almacenamiento

- `localStorage.setItem()`: guarda información.
- `localStorage.getItem()`: recupera información.
- `localStorage.removeItem()`: elimina una clave.
- `JSON.stringify()`: convierte objetos JavaScript en texto JSON.
- `JSON.parse()`: convierte texto JSON en objetos JavaScript.

**Nota de seguridad:** `localStorage` no es una base de datos segura ni reemplaza un sistema de autenticación con servidor. El login de este proyecto es una validación local de práctica: las credenciales están en el código JavaScript (`js/app.js`) y cualquier persona con acceso al navegador podría verlas.

## 7. Estructura del proyecto

```text
Biblioteca-del-Campus/
│
├── login.html        (inicio de sesión)
├── index.html        (inicio / resumen)
├── catalogo.html     (catálogo, Open Library y favoritos)
├── registrar.html    (registro de libros)
│
├── css/
│   └── estilos.css
│
├── js/
│   ├── app.js        (sesión, modo nocturno, avisos)
│   └── libros.js     (catálogo, préstamos, devoluciones, API, favoritos)
│
└── README.txt
```

La estructura puede variar según las páginas adicionales que se incorporen al proyecto.

## 8. Instalación y ejecución

### Requisitos

- Un navegador web actualizado.
- Un editor de código, como Visual Studio Code.
- Conexión a Internet para consultar Open Library.

### Pasos

1. Descargar o clonar el proyecto.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Verificar que las rutas de los archivos CSS y JavaScript sean correctas.
4. Ejecutar `login.html` mediante la extensión Live Server o un servidor web local.
5. Iniciar sesión con `ADMIN` / `1234` e ingresar al catálogo.
6. Realizar búsquedas para comprobar la conexión con la API.

Se recomienda utilizar Live Server en lugar de abrir directamente los archivos mediante `file://`, para evitar problemas de origen y facilitar las pruebas de las solicitudes HTTP.

## 9. Manejo de errores

La aplicación debe contemplar las siguientes situaciones:

- **Carga:** se está consultando la API.
- **Error HTTP:** el servidor devuelve una respuesta no exitosa.
- **Error de conexión:** la solicitud no puede completarse.
- **Sin resultados:** no se encuentran libros para la búsqueda.
- **Resultados disponibles:** la consulta devuelve información que puede mostrarse.

Las restricciones de CORS dependen de la configuración del servidor de la API. Si se presenta un error de conexión, se debe revisar también la consola del navegador.

## 10. Consideraciones

- La búsqueda de Open Library requiere conexión a Internet.
- Los datos guardados en `localStorage` pertenecen al navegador y al origen utilizados.
- Borrar los datos del navegador puede eliminar el catálogo y los favoritos.
- El contador de préstamos local no constituye un sistema institucional de circulación de libros.
- La disponibilidad de portadas y datos bibliográficos depende de la información proporcionada por la API.
- La caché de resultados permite reducir consultas repetidas durante el periodo de validez configurado.

## 11. Integrantes

- Integrante 1: [Nombre completo]
- Integrante 2: [Nombre completo]
- Integrante 3: [Nombre completo]

## 12. Conclusión

Biblioteca del Campus integra tecnologías web fundamentales para desarrollar una aplicación interactiva. El proyecto combina la consulta de una API REST pública con la manipulación de datos JSON, el manejo asíncrono de solicitudes HTTP y el almacenamiento local en el navegador.

De esta manera, permite aplicar conceptos de desarrollo web, consumo de servicios externos, persistencia de datos y diseño de interfaces.

## 13. Licencia

Proyecto académico desarrollado con fines educativos.
