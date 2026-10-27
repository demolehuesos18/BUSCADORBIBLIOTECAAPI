
"use strict";

/* =========================================
   CONFIGURACIÓN Y ALMACENAMIENTO
========================================= */

const CLAVE_CATALOGO = "catalogo";
const CLAVE_PRESTAMOS = "prestamos";
const CLAVE_DEVOLUCIONES = "devoluciones";
const CLAVE_FAVORITOS = "favoritosAPI";
const CLAVE_CACHE = "cacheOpenLibrary";

const API_URL = "https://openlibrary.org/search.json";
const POR_PAGINA = 10;
const DURACION_CACHE = 5 * 60 * 1000;

function leerLista(clave) {
    try {
        const datos = JSON.parse(localStorage.getItem(clave) || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarLista(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function obtenerCatalogo() {
    return leerLista(CLAVE_CATALOGO);
}

/* Libros iniciales: se crean solamente la primera vez. */
function inicializarCatalogo() {
    if (localStorage.getItem(CLAVE_CATALOGO) !== null) return;

    const iniciales = [
        {
            id: "inicial-1",
            titulo: "Breve historia del tiempo",
            autor: "Stephen Hawking",
            isbn: "",
            anio: "1988",
            categoria: "Ciencias",
            ejemplares: 8,
            disponibles: 8
        },
        {
            id: "inicial-2",
            titulo: "Cálculo de una variable",
            autor: "James Stewart",
            isbn: "",
            anio: "2018",
            categoria: "Ingeniería",
            ejemplares: 10,
            disponibles: 10
        },
        {
            id: "inicial-3",
            titulo: "Cien años de soledad",
            autor: "Gabriel García Márquez",
            isbn: "",
            anio: "1967",
            categoria: "Literatura",
            ejemplares: 12,
            disponibles: 12
        },
        {
            id: "inicial-4",
            titulo: "El Man está Vivo",
            autor: "Padre Alberto Linero",
            isbn: "",
            anio: "2024",
            categoria: "Historia",
            ejemplares: 7,
            disponibles: 7
        },
        {
            id: "inicial-5",
            titulo: "Historia del arte",
            autor: "Ernst Gombrich",
            isbn: "",
            anio: "1950",
            categoria: "Arte",
            ejemplares: 6,
            disponibles: 6
        },
        {
            id: "inicial-6",
            titulo: "La Vorágine",
            autor: "José Eustasio Rivera",
            isbn: "",
            anio: "1924",
            categoria: "Literatura",
            ejemplares: 4,
            disponibles: 4
        }
    ];

    guardarLista(CLAVE_CATALOGO, iniciales);
}

function disponiblesDe(libro) {
    const total = Math.max(0, Number(libro.ejemplares) || 0);
    const disponibles = libro.disponibles === undefined
        ? total
        : Number(libro.disponibles);

    return Math.max(0, Math.min(
        total,
        Number.isFinite(disponibles) ? disponibles : total
    ));
}

function crearId() {
    if (globalThis.crypto && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* =========================================
   REGISTRAR LIBROS
   Compatible con registrar.html existente
========================================= */

function guardarLibro() {
    const titulo = document.getElementById("titulo")?.value.trim() || "";
    const autor = document.getElementById("autor")?.value.trim() || "";
    const isbn = document.getElementById("isbn")?.value.trim() || "";
    const anio = document.getElementById("anio")?.value.trim() || "";
    const ejemplaresTexto =
        document.getElementById("ejemplares")?.value.trim() || "";
    const categoria = document.getElementById("categoria")?.value || "";

    const cantidad = Number(ejemplaresTexto);

    if (!titulo || !autor) {
        mostrarAviso("Debes escribir el título y el autor.", "error");
        return;
    }

    if (!categoria) {
        mostrarAviso("Selecciona una categoría.", "error");
        return;
    }

    if (
        !ejemplaresTexto ||
        !Number.isInteger(cantidad) ||
        cantidad < 1
    ) {
        mostrarAviso("Los ejemplares deben ser un número entero mayor que cero.", "error");
        return;
    }

    const libro = {
        id: crearId(),
        titulo,
        autor,
        isbn,
        anio,
        categoria,
        ejemplares: cantidad,
        disponibles: cantidad
    };

    const catalogo = obtenerCatalogo();
    catalogo.push(libro);

    try {
        guardarLista(CLAVE_CATALOGO, catalogo);
        mostrarAviso("Libro registrado correctamente.");
        setTimeout(() => { window.location.href = "catalogo.html"; }, 900);
    } catch {
        mostrarAviso("No se pudo guardar el libro en el navegador.", "error");
    }
}

/* =========================================
   PRÉSTAMOS Y DEVOLUCIONES
========================================= */

function sumarContador(clave) {
    const actual = Number(localStorage.getItem(clave)) || 0;
    localStorage.setItem(clave, String(actual + 1));
}

function prestarLibro(id) {
    if (!id) return;

    const catalogo = obtenerCatalogo();
    const libro = catalogo.find(item => item.id === id);

    if (!libro) {
        mostrarAviso("No se encontró el libro en el catálogo.", "error");
        return;
    }

    const disponibles = disponiblesDe(libro);

    if (disponibles <= 0) {
        mostrarAviso("No hay ejemplares disponibles.", "error");
        return;
    }

    libro.disponibles = disponibles - 1;

    try {
        guardarLista(CLAVE_CATALOGO, catalogo);
        sumarContador(CLAVE_PRESTAMOS);
        renderizarCatalogoLocal();
        mostrarAviso(`Préstamo registrado: "${libro.titulo}".`);
    } catch {
        mostrarAviso("No se pudo guardar el préstamo.", "error");
    }
}

function devolverLibro(id) {
    if (!id) return;

    const catalogo = obtenerCatalogo();
    const libro = catalogo.find(item => item.id === id);

    if (!libro) {
        mostrarAviso("No se encontró el libro en el catálogo.", "error");
        return;
    }

    const total = Math.max(0, Number(libro.ejemplares) || 0);
    const disponibles = disponiblesDe(libro);

    if (disponibles >= total) {
        mostrarAviso("Todos los ejemplares ya están en la biblioteca.", "info");
        return;
    }

    libro.disponibles = disponibles + 1;

    try {
        guardarLista(CLAVE_CATALOGO, catalogo);
        sumarContador(CLAVE_DEVOLUCIONES);
        renderizarCatalogoLocal();
        mostrarAviso(`Devolución registrada: "${libro.titulo}".`);
    } catch {
        mostrarAviso("No se pudo guardar la devolución.", "error");
    }
}

/* =========================================
   RENDERIZAR Y FILTRAR CATÁLOGO LOCAL
========================================= */

function renderizarCatalogoLocal() {
    const cuerpo = document.getElementById("cuerpoCatalogo");
    if (!cuerpo) return;

    const busqueda = (
        document.getElementById("buscarLocal")?.value || ""
    ).trim().toLowerCase();

    const selector = document.getElementById("filtroCategoria");
    const categoria = selector?.value || "";
    const catalogo = obtenerCatalogo();

    const categorias = [...new Set(
        catalogo.map(libro => libro.categoria).filter(Boolean)
    )].sort();

    if (selector) {
        const anterior = selector.value;

        selector.innerHTML = "";
        const opcionTodas = document.createElement("option");
        opcionTodas.value = "";
        opcionTodas.textContent = "Todas las categorías";
        selector.appendChild(opcionTodas);

        categorias.forEach(nombre => {
            const opcion = document.createElement("option");
            opcion.value = nombre;
            opcion.textContent = nombre;
            selector.appendChild(opcion);
        });

        selector.value = categorias.includes(anterior) ? anterior : "";
    }

    const filtrados = catalogo.filter(libro => {
        const coincideTexto =
            String(libro.titulo || "").toLowerCase().includes(busqueda) ||
            String(libro.autor || "").toLowerCase().includes(busqueda);

        return coincideTexto &&
            (!categoria || libro.categoria === categoria);
    });

    cuerpo.replaceChildren();

    const estado = document.getElementById("estadoLocal");
    if (estado) {
        estado.textContent = filtrados.length
            ? `${filtrados.length} libro(s) encontrados.`
            : "No hay libros que coincidan con la búsqueda.";
    }

    filtrados.forEach(libro => {
        const fila = document.createElement("tr");
        fila.dataset.libroId = libro.id;

        const total = Math.max(0, Number(libro.ejemplares) || 0);
        const disponibles = disponiblesDe(libro);

        [libro.titulo, libro.autor, libro.anio, libro.categoria].forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor ?? "";
            fila.appendChild(celda);
        });

        const celdaDisp = document.createElement("td");
        const etiqueta = document.createElement("span");
        etiqueta.className = disponibles > 0 ? "disponible" : "agotado";
        etiqueta.textContent = disponibles > 0
            ? `${disponibles}/${total}`
            : `${disponibles}/${total} · Agotado`;
        celdaDisp.appendChild(etiqueta);
        fila.appendChild(celdaDisp);

        const acciones = document.createElement("td");

        const btnPrestar = document.createElement("button");
        btnPrestar.type = "button";
        btnPrestar.textContent = "Prestar";
        btnPrestar.className = "exito";
        btnPrestar.title = "Prestar un ejemplar";
        btnPrestar.disabled = disponibles <= 0;
        btnPrestar.addEventListener("click", () => prestarLibro(libro.id));

        const btnDevolver = document.createElement("button");
        btnDevolver.type = "button";
        btnDevolver.textContent = "Devolver";
        btnDevolver.title = "Devolver un ejemplar prestado";
        btnDevolver.disabled = disponibles >= total;
        btnDevolver.addEventListener("click", () => devolverLibro(libro.id));

        acciones.append(btnPrestar, document.createTextNode(" "), btnDevolver);
        fila.appendChild(acciones);
        cuerpo.appendChild(fila);
    });
}

/* =========================================
   API OPEN LIBRARY: ESTADO Y CACHÉ
========================================= */

let consultaActual = "";
let paginaActual = 1;
let totalResultados = 0;
let idSolicitud = 0;

function leerCache(clave) {
    try {
        const cache = JSON.parse(localStorage.getItem(CLAVE_CACHE) || "{}");
        const entrada = cache[clave];

        if (!entrada) return null;

        if (Date.now() > entrada.expira) {
            delete cache[clave];
            localStorage.setItem(CLAVE_CACHE, JSON.stringify(cache));
            return null;
        }

        return entrada.datos;
    } catch {
        return null;
    }
}

function guardarCache(clave, datos) {
    try {
        const cache = JSON.parse(localStorage.getItem(CLAVE_CACHE) || "{}");

        cache[clave] = {
            datos,
            expira: Date.now() + DURACION_CACHE
        };

        const claves = Object.keys(cache);
        while (claves.length > 20) {
            delete cache[claves.shift()];
        }

        localStorage.setItem(CLAVE_CACHE, JSON.stringify(cache));
    } catch (error) {
        console.warn("No se pudo guardar la caché:", error);
    }
}

function actualizarPaginacion() {
    const anterior = document.getElementById("paginaAnterior");
    const siguiente = document.getElementById("paginaSiguiente");
    const numero = document.getElementById("numeroPagina");

    if (numero) numero.textContent = `Página ${paginaActual}`;
    if (anterior) anterior.disabled = paginaActual <= 1;
    if (siguiente) {
        siguiente.disabled =
            paginaActual * POR_PAGINA >= totalResultados;
    }
}

async function buscarEnAPI(consulta, pagina = 1) {
    const estado = document.getElementById("estadoAPI");
    const resultados = document.getElementById("resultadosAPI");
    const boton = document.getElementById("btnBuscarAPI");

    if (!estado || !resultados) return;

    const solicitud = ++idSolicitud;

    consultaActual = consulta;
    paginaActual = pagina;

    estado.textContent = "Cargando libros...";
    resultados.replaceChildren();

    if (boton) boton.disabled = true;

    const parametros = new URLSearchParams({
        q: consulta,
        page: String(pagina),
        limit: String(POR_PAGINA)
    });

    const clave = `${consulta.toLowerCase()}|${pagina}`;

    try {
        let datos = leerCache(clave);

        if (!datos) {
            const respuesta = await fetch(
                `${API_URL}?${parametros.toString()}`,
                { headers: { Accept: "application/json" } }
            );

            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status}`);
            }

            datos = await respuesta.json();
            guardarCache(clave, datos);
        }

        if (solicitud !== idSolicitud) return;

        const libros = Array.isArray(datos.docs) ? datos.docs : [];
        totalResultados = Number(datos.numFound ?? datos.num_found ?? 0);

        if (!libros.length) {
            estado.textContent = "No se encontraron resultados.";
            actualizarPaginacion();
            return;
        }

        estado.textContent =
            `Se encontraron ${totalResultados.toLocaleString()} resultados.`;

        mostrarResultadosAPI(libros);
        actualizarPaginacion();

    } catch (error) {
        if (solicitud !== idSolicitud) return;

        console.error(error);

        estado.textContent = error instanceof TypeError
            ? "Error de conexión o posible bloqueo CORS. Comprueba Internet y la consola del navegador."
            : `No se pudo consultar la API: ${error.message}`;

    } finally {
        if (solicitud === idSolicitud && boton) {
            boton.disabled = false;
        }
    }
}

/* =========================================
   MOSTRAR RESULTADOS EXTERNOS
========================================= */

function mostrarResultadosAPI(libros) {
    const contenedor = document.getElementById("resultadosAPI");
    if (!contenedor) return;

    contenedor.replaceChildren();

    libros.forEach(libro => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-libro";

        if (libro.cover_i && Number.isFinite(Number(libro.cover_i))) {
            const imagen = document.createElement("img");
            imagen.src =
                `https://covers.openlibrary.org/b/id/${Number(libro.cover_i)}-M.jpg`;
            imagen.alt = `Portada de ${libro.title || "libro"}`;
            imagen.loading = "lazy";
            tarjeta.appendChild(imagen);
        }

        const titulo = document.createElement("h3");
        titulo.textContent = libro.title || "Título desconocido";

        const autor = document.createElement("p");
        autor.textContent = "Autor: " +
            (Array.isArray(libro.author_name)
                ? libro.author_name.join(", ")
                : "No disponible");

        const anio = document.createElement("p");
        anio.textContent = "Primera publicación: " +
            (libro.first_publish_year || "No disponible");

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "⭐ Guardar favorito";

        boton.addEventListener("click", () => guardarFavorito(libro));

        tarjeta.append(titulo, autor, anio, boton);
        contenedor.appendChild(tarjeta);
    });
}

/* =========================================
   FAVORITOS
========================================= */

function guardarFavorito(libro) {
    const favoritos = leerLista(CLAVE_FAVORITOS);
    const clave = libro.key || libro.title;

    if (favoritos.some(item =>
        (item.key || item.title) === clave
    )) {
        mostrarAviso("Este libro ya está en tus favoritos.", "info");
        return;
    }

    favoritos.push({
        key: libro.key || "",
        title: libro.title || "Título desconocido",
        author_name: Array.isArray(libro.author_name)
            ? libro.author_name
            : [],
        first_publish_year: libro.first_publish_year || null,
        cover_i: libro.cover_i || null
    });

    guardarLista(CLAVE_FAVORITOS, favoritos);
    renderizarFavoritos();
    mostrarAviso("Libro guardado en favoritos.");
}

function eliminarFavorito(clave) {
    const favoritos = leerLista(CLAVE_FAVORITOS).filter(item =>
        (item.key || item.title) !== clave
    );

    guardarLista(CLAVE_FAVORITOS, favoritos);
    renderizarFavoritos();
    mostrarAviso("Libro quitado de favoritos.", "info");
}

function renderizarFavoritos() {
    const contenedor = document.getElementById("listaFavoritos");
    const estado = document.getElementById("estadoFavoritos");

    if (!contenedor || !estado) return;

    const favoritos = leerLista(CLAVE_FAVORITOS);
    contenedor.replaceChildren();

    estado.textContent = favoritos.length
        ? `${favoritos.length} libro(s) guardados.`
        : "Todavía no tienes favoritos.";

    favoritos.forEach(libro => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-libro";

        if (libro.cover_i && Number.isFinite(Number(libro.cover_i))) {
            const imagen = document.createElement("img");
            imagen.src =
                `https://covers.openlibrary.org/b/id/${Number(libro.cover_i)}-M.jpg`;
            imagen.alt = `Portada de ${libro.title}`;
            imagen.loading = "lazy";
            tarjeta.appendChild(imagen);
        }

        const titulo = document.createElement("h3");
        titulo.textContent = libro.title;

        const autor = document.createElement("p");
        autor.textContent = Array.isArray(libro.author_name)
            ? libro.author_name.join(", ")
            : "Autor no disponible";

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Quitar favorito";
        boton.addEventListener("click", () =>
            eliminarFavorito(libro.key || libro.title)
        );

        tarjeta.append(titulo, autor, boton);
        contenedor.appendChild(tarjeta);
    });
}

/* =========================================
   RESUMEN DE LA PÁGINA DE INICIO
========================================= */

function renderizarInicio() {
    if (!document.getElementById("statTitulos")) return;

    const catalogo = obtenerCatalogo();
    const total = catalogo.reduce(
        (suma, libro) => suma + Math.max(0, Number(libro.ejemplares) || 0), 0
    );
    const disponibles = catalogo.reduce(
        (suma, libro) => suma + disponiblesDe(libro), 0
    );

    const valores = {
        statTitulos: catalogo.length,
        statDisponibles: disponibles,
        statPrestados: total - disponibles,
        statPrestamos: Number(localStorage.getItem(CLAVE_PRESTAMOS)) || 0,
        statDevoluciones: Number(localStorage.getItem(CLAVE_DEVOLUCIONES)) || 0,
        statFavoritos: leerLista(CLAVE_FAVORITOS).length
    };

    Object.entries(valores).forEach(([id, valor]) => {
        document.getElementById(id).textContent = valor.toLocaleString();
    });
}

/* =========================================
   INICIALIZAR PÁGINA
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    inicializarCatalogo();

    const buscarLocal = document.getElementById("buscarLocal");
    const filtro = document.getElementById("filtroCategoria");
    const formulario = document.getElementById("formBusqueda");
    const anterior = document.getElementById("paginaAnterior");
    const siguiente = document.getElementById("paginaSiguiente");
    const limpiar = document.getElementById("btnLimpiarFiltros");
    const formRegistro = document.getElementById("formRegistro");

    if (formRegistro) {
        formRegistro.addEventListener("submit", event => {
            event.preventDefault();
            guardarLibro();
        });
    }

    if (limpiar) {
        limpiar.addEventListener("click", () => {
            if (buscarLocal) buscarLocal.value = "";
            if (filtro) filtro.value = "";
            renderizarCatalogoLocal();
            buscarLocal?.focus();
        });
    }

    if (buscarLocal) {
        buscarLocal.addEventListener("input", renderizarCatalogoLocal);
    }

    if (filtro) {
        filtro.addEventListener("change", renderizarCatalogoLocal);
    }

    if (formulario) {
        formulario.addEventListener("submit", event => {
            event.preventDefault();

            const consulta =
                document.getElementById("consultaAPI").value.trim();

            if (!consulta) {
                document.getElementById("estadoAPI").textContent =
                    "Escribe un título o autor.";
                return;
            }

            buscarEnAPI(consulta, 1);
        });
    }

    if (anterior) {
        anterior.addEventListener("click", () => {
            if (paginaActual > 1) {
                buscarEnAPI(consultaActual, paginaActual - 1);
            }
        });
    }

    if (siguiente) {
        siguiente.addEventListener("click", () => {
            if (paginaActual * POR_PAGINA < totalResultados) {
                buscarEnAPI(consultaActual, paginaActual + 1);
            }
        });
    }

    renderizarCatalogoLocal();
    renderizarFavoritos();
    renderizarInicio();
});
