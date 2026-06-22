let tablaRutas = {};

async function inicializarEnrutador() {
    try {
        const respuesta = await fetch('rutas.json');
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
        // 1. Extraemos los tres valores fundamentales para el enrutador
        const { "hx-get": urlFragmento, "hx-target": selectorDestino, "hx-swap": metodoSwap, ...atributosExtra } = configuracionRuta;

        // 2. Validamos que tengamos al menos la URL y el destino, y que HTMX/DOM estén listos
        if (!urlFragmento || !selectorDestino) {
            console.error(`La ruta ${hashActual} no tiene configurado hx-get o hx-target.`);
            return;
        }

        if (typeof htmx !== 'undefined' && document.querySelector(selectorDestino)) {

            // 3. Construimos el objeto de opciones de HTMX dinámicamente
            const opcionesHtmx = {
                target: selectorDestino,
                swap: metodoSwap || 'innerHTML',
                // Pasamos todo lo demás (hx-trigger, hx-push-url, headers, etc.) de forma automática
                ...atributosExtra
            };

            // 4. Ejecutamos la petición con la configuración exacta del JSON
            htmx.ajax('GET', urlFragmento, opcionesHtmx);

        } else {
            // Reintento por si el DOM o el layout base no han terminado de cargar
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