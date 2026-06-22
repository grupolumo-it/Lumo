let tablaRutas = {};
// Definimos una ruta por defecto por si el atributo no está presente
let rutaJsonDefault = 'rutas.json';

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

function procesarRuta() {
    const hashActual = window.location.hash || '#homepage';
    const configuracionRuta = tablaRutas[hashActual];

    if (configuracionRuta) {
        const { "hx-get": urlFragmento, "hx-target": selectorDestino, "hx-swap": metodoSwap, ...atributosExtra } = configuracionRuta;

        if (!urlFragmento || !selectorDestino) {
            console.error(`La ruta ${hashActual} no tiene configurado hx-get o hx-target.`);
            return;
        }

        if (typeof htmx !== 'undefined' && document.querySelector(selectorDestino)) {
            const opcionesHtmx = {
                target: selectorDestino,
                swap: metodoSwap || 'innerHTML',
                ...atributosExtra
            };

            htmx.ajax('GET', urlFragmento, opcionesHtmx);
        } else {
            setTimeout(procesarRuta, 50);
        }
    } else {
        console.warn(`Ruta no encontrada en la tabla: ${hashActual}`);
        window.location.hash = '#homepage';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarEnrutador);
} else {
    inicializarEnrutador();
}