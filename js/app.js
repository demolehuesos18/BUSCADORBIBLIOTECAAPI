"use strict";

/* =========================================
   SESIÓN (LOGIN)
   Nota: es una validación local de práctica; no reemplaza
   una autenticación real con servidor.
========================================= */

const CLAVE_SESION = "usuarioActivo";
const USUARIO_VALIDO = "ADMIN";
const CLAVE_VALIDA = "1234";

function haySesion() {
    return localStorage.getItem(CLAVE_SESION) === USUARIO_VALIDO;
}

/* Páginas privadas exigen sesión; login.html (data-publica) redirige si ya hay sesión. */
(function protegerPagina() {
    const esPublica = document.body.dataset.publica === "true";

    if (!esPublica && !haySesion()) {
        window.location.replace("login.html");
    } else if (esPublica && haySesion()) {
        window.location.replace("index.html");
    }
})();

function iniciarSesion(usuario, clave) {
    if (usuario.trim().toUpperCase() === USUARIO_VALIDO && clave === CLAVE_VALIDA) {
        localStorage.setItem(CLAVE_SESION, USUARIO_VALIDO);
        return true;
    }
    return false;
}

function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    window.location.href = "login.html";
}

/* =========================================
   AVISOS EMERGENTES
========================================= */

function mostrarAviso(texto, tipo = "exito") {
    let caja = document.getElementById("avisos");

    if (!caja) {
        caja = document.createElement("div");
        caja.id = "avisos";
        caja.setAttribute("role", "status");
        caja.setAttribute("aria-live", "polite");
        document.body.appendChild(caja);
    }

    const aviso = document.createElement("div");
    aviso.className = `aviso aviso-${tipo}`;
    aviso.textContent = texto;
    caja.appendChild(aviso);

    setTimeout(() => aviso.remove(), 3500);
}

/* =========================================
   MODO NOCTURNO
========================================= */

function actualizarTextoModo() {
    const boton = document.getElementById("btnModo");
    if (!boton) return;

    boton.textContent = document.body.classList.contains("noche")
        ? "☀️ Modo claro"
        : "🌙 Modo nocturno";
}

function toggleModo() {
    document.body.classList.toggle("noche");

    const modo = document.body.classList.contains("noche")
        ? "noche"
        : "dia";

    localStorage.setItem("modo", modo);
    actualizarTextoModo();
}

function aplicarModoGuardado() {
    const modo = localStorage.getItem("modo");

    document.body.classList.toggle("noche", modo === "noche");
    actualizarTextoModo();
}

/* =========================================
   MENÚ Y LOGIN
========================================= */

function marcarEnlaceActivo() {
    const actual = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".sidebar nav a").forEach(enlace => {
        const destino = enlace.getAttribute("href").split("#")[0];
        enlace.classList.toggle("activo", destino === actual);
    });
}

function configurarLogin() {
    const formulario = document.getElementById("formLogin");
    if (!formulario) return;

    const usuario = document.getElementById("usuario");
    const clave = document.getElementById("clave");
    const mensaje = document.getElementById("mensajeLogin");
    const verClave = document.getElementById("btnVerClave");

    verClave?.addEventListener("click", () => {
        const visible = clave.type === "text";
        clave.type = visible ? "password" : "text";
        verClave.textContent = visible ? "👁 Mostrar" : "🙈 Ocultar";
        verClave.setAttribute("aria-pressed", String(!visible));
        clave.focus();
    });

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        if (iniciarSesion(usuario.value, clave.value)) {
            window.location.href = "index.html";
            return;
        }

        mensaje.textContent = "Usuario o contraseña incorrectos.";
        mensaje.className = "estado-error";
        clave.value = "";
        clave.focus();
    });

    [usuario, clave].forEach(campo =>
        campo.addEventListener("input", () => {
            mensaje.textContent = "";
            mensaje.className = "";
        })
    );

    usuario.focus();
}

document.addEventListener("DOMContentLoaded", () => {
    aplicarModoGuardado();
    marcarEnlaceActivo();
    configurarLogin();

    document.getElementById("btnModo")?.addEventListener("click", toggleModo);
    document.getElementById("btnCerrarSesion")?.addEventListener("click", cerrarSesion);
});
