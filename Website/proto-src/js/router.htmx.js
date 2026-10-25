let tablaRutas = {};
// Definimos una ruta por defecto por si el atributo no está presente
let rutaJsonDefault = 'rutas.json';

// Si el contenedor destino todavía no existe (el layout se carga por HTMX),
// reintentamos unas pocas veces. Si nunca aparece, caemos a una recarga de
// página: así evitamos el bucle infinito de reintentos que dejaba la web
// colgada sin forma de salir.
const MAX_INTENTOS = 40;
const DELAY_REINTENTO = 50;

// Clave opcional en rutas.json. Cuando vale true, la ruta se resuelve como
// página completa (navegación del navegador) en lugar de como fragmento HTMX.
// Se usa para páginas que son documentos HTML autónomos (login, detalle...).
const CLAVE_PAGINA_COMPLETA = 'pagina';

// htmx dispara 'htmx:afterSettle' cuando una inserción ha terminado de
// asentarse (ya se han inicializado sus widgets). Esperamos a ese evento antes
// de cargar la página: si la insertamos mientras el layout todavía se está
// procesando, sus widgets se inicializan DOS veces (peticiones duplicadas) y la
// segunda respuesta llega a un nodo ya reemplazado, lo que rompe el swap.
let maquinaAsentada = false;

document.addEventListener('htmx:afterSettle', function () {
    maquinaAsentada = true;
});

// Al cambiar el hash, el navegador crea una nueva entrada en el historial y
// RESTAURA la posición del scroll de esa entrada, anulando el scroll al
// inicio que hacemos tras cada navegación. Lo desactivamos para que el
// enrutador tenga el control.
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

async function inicializarEnrutador() {
    try {
        // 1. Detectamos el script actual y obtenemos la ruta del atributo data-config
        const scriptActual = document.currentScript;
        const rutaJson = (scriptActual && scriptActual.dataset.config) ? scriptActual.dataset.config : rutaJsonDefault;

        // 2. Realizamos el fetch con la ruta dinámica
        const respuesta = await fetch(rutaJson);
        tablaRutas = await respuesta.json();

        window.addEventListener('hashchange', procesarRuta);
        procesarRuta();
    } catch (error) {
        console.error("Error cargando la tabla de rutas:", error);
    }
}

function procesarRuta(intentos = 0) {
    const hashActual = window.location.hash || '#homepage';
    const configuracionRuta = tablaRutas[hashActual];

    if (!configuracionRuta) {
        console.warn(`Ruta no encontrada en la tabla: ${hashActual}`);
        window.location.hash = '#homepage';
        return;
    }

    const { "hx-get": urlFragmento, "hx-target": selectorDestino, "hx-swap": metodoSwap } = configuracionRuta;

    if (!urlFragmento) {
        console.error(`La ruta ${hashActual} no tiene configurado hx-get.`);
        return;
    }

    // Página completa: no es un fragmento, navegamos con el navegador.
    if (configuracionRuta[CLAVE_PAGINA_COMPLETA]) {
        window.location.href = urlFragmento;
        return;
    }

    if (!selectorDestino) {
        console.error(`La ruta ${hashActual} no tiene configurado hx-target.`);
        return;
    }

    if (typeof htmx === 'undefined') {
        console.error("HTMX no está disponible: no se puede resolver la ruta.");
        return;
    }

    // El layout se inyecta por HTMX, así que #main-container puede no existir
    // todavía. Esperamos un poco y reintentamos.
    if (!document.querySelector(selectorDestino)) {
        reintentar(hashActual, intentos);
        return;
    }

    // Esperamos a que htmx termine de asentar el layout antes de insertar la
    // página: insertarla antes provoca la doble inicialización de sus widgets.
    if (!maquinaAsentada) {
        reintentar(hashActual, intentos);
        return;
    }

    const opcionesHtmx = {
        target: selectorDestino,
        swap: metodoSwap || 'innerHTML'
    };

    // El scroll al inicio va DESPUÉS del swap. Si lo hacíamos antes de que
    // llegara el HTML, el cambio de altura del documento (la página nueva
    // tiene otra longitud) cancelaba la animación y el usuario se quedaba
    // a media altura o al final de la página.
    const limpiarScroll = function () {
        document.removeEventListener('htmx:afterSwap', alHacerSwap);
        document.removeEventListener('htmx:responseError', alFallar);
        document.removeEventListener('htmx:sendError', alFallar);
    };

    function alHacerSwap() {
        limpiarScroll();
        // Un tick de margen para que el navegador pinte el DOM nuevo antes
        // de desplazar: así el scroll no se pierde por el cambio de altura.
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }, 0);
    }

    function alFallar() {
        limpiarScroll();
    }

    document.addEventListener('htmx:afterSwap', alHacerSwap);
    document.addEventListener('htmx:responseError', alFallar);
    document.addEventListener('htmx:sendError', alFallar);

    htmx.ajax('GET', urlFragmento, opcionesHtmx);
}

/**
 * Reintenta la resolución de la ruta tras un breve delay.
 * Si se agotan los intentos, recarga la página: es preferible un refresh
 * a quedar con la web colgada.
 */
function reintentar(hashActual, intentos) {
    if (intentos < MAX_INTENTOS) {
        setTimeout(() => procesarRuta(intentos + 1), DELAY_REINTENTO);
    } else {
        console.warn(`No se pudo resolver la ruta ${hashActual}: recargando la página.`);
        window.location.reload();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarEnrutador);
} else {
    inicializarEnrutador();
}
