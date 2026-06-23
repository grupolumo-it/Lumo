/**
 * ============================================================================
 * HTMX Extension: wrapper-swap
 * ============================================================================
 *
 * Añade un nuevo método de swap llamado "wrapper" a HTMX.
 *
 * Comportamiento:
 *   En lugar de reemplazar o insertar contenido *dentro* del target,
 *   el HTML devuelto por el servidor actúa como un envoltorio (contenedor
 *   externo) alrededor del elemento original que hizo la petición.
 *
 * Uso:
 *   1. En el elemento que dispara la petición:
 *        <div hx-get="ruta/al/wrapper.html" hx-swap="wrapper" hx-trigger="load">
 *          ...contenido original...
 *        </div>
 *
 *   2. En el HTML del servidor (el envoltorio), incluir un marcador vacío
 *      con el atributo `hx-wrapper` para indicar dónde se insertará el
 *      contenido original:
 *        <div class="envoltorio">
 *          <div hx-wrapper></div>
 *        </div>
 *
 * Evento interceptado:
 *   htmx:beforeSwap — se dispara justo antes de que HTMX ejecute su
 *   lógica de swap. Prevenimos el swap por defecto asignando
 *   evt.detail.shouldSwap = false.
 *
 * ============================================================================
 */

(function () {
    "use strict";

    // ─── Constantes ─────────────────────────────────────────────────────
    var EXTENSION_NAME  = "wrapper-swap";
    var SWAP_STYLE      = "wrapper";
    var MARKER_SELECTOR = "[hx-wrapper]";

    // Atributos que se limpian del elemento clonado para prevenir
    // que vuelva a disparar la misma petición una vez envuelto.
    var ATTRS_TO_CLEAN = ["hx-get", "hx-swap", "hx-trigger", "hx-target"];

    // ─── Utilidades ─────────────────────────────────────────────────────

    /**
     * Parsea una cadena de HTML y devuelve un DocumentFragment.
     * Usa <template> internamente para evitar la ejecución inmediata
     * de scripts embebidos.
     *
     * @param {string} htmlString - Cadena de HTML a parsear.
     * @returns {DocumentFragment}
     */
    function parseHTML(htmlString) {
        var template = document.createElement("template");
        template.innerHTML = htmlString.trim();
        return template.content;
    }

    /**
     * Elimina los atributos HTMX peligrosos del elemento dado para
     * evitar bucles infinitos de peticiones tras envolverlo.
     *
     * @param {HTMLElement} element - El elemento a limpiar.
     */
    function cleanHtmxAttributes(element) {
        ATTRS_TO_CLEAN.forEach(function (attr) {
            element.removeAttribute(attr);
        });
    }

    /**
     * Extrae el estilo de swap del detalle del evento htmx:beforeSwap.
     * Intenta leerlo de requestConfig primero; si no existe, lee
     * directamente el atributo hx-swap del elemento disparador.
     *
     * @param {object} detail - evt.detail del evento htmx:beforeSwap.
     * @returns {string} El estilo de swap (primer token, sin modificadores).
     */
    function getSwapStyle(detail) {
        var raw = "";

        // 1. Intentar desde requestConfig (HTMX 1.x y 2.x)
        if (detail.requestConfig && detail.requestConfig.swapStyle) {
            raw = detail.requestConfig.swapStyle;
        }
        // 2. Fallback: leer directamente del atributo hx-swap del elemento
        else if (detail.elt && detail.elt.getAttribute) {
            raw = detail.elt.getAttribute("hx-swap") || "";
        }

        // hx-swap puede tener modificadores (ej: "wrapper scroll:top"),
        // el estilo es siempre el primer token.
        return raw.split(/\s+/)[0];
    }

    // ─── Lógica principal ───────────────────────────────────────────────

    /**
     * Procesa el swap de tipo "wrapper":
     *   1. Parsea el HTML del servidor.
     *   2. Localiza el marcador [hx-wrapper].
     *   3. Clona el target, limpia atributos y reemplaza el marcador.
     *   4. Inserta el envoltorio en el DOM y lo registra con HTMX.
     *
     * @param {HTMLElement} target     - El elemento original en el DOM.
     * @param {string}      serverHTML - El HTML devuelto por el servidor.
     */
    function performWrapperSwap(target, serverHTML) {

        // 1. Parsear el HTML del servidor en un DocumentFragment
        var wrapperFragment = parseHTML(serverHTML);

        // 2. Localizar el marcador [hx-wrapper] dentro del envoltorio
        var marker = wrapperFragment.querySelector(MARKER_SELECTOR);

        if (!marker) {
            console.warn(
                "[" + EXTENSION_NAME + "] El HTML del servidor no contiene " +
                "un elemento con el atributo 'hx-wrapper'. " +
                "El swap de tipo '" + SWAP_STYLE + "' no se pudo completar. " +
                "Asegúrate de incluir un marcador como <div hx-wrapper></div> " +
                "en el HTML del envoltorio."
            );
            return;
        }

        // 3. Clonar el elemento target original (deep clone)
        var clonedTarget = target.cloneNode(true);

        // 4. Limpiar atributos hx-get, hx-swap, hx-trigger y hx-target
        //    del clon para prevenir que vuelva a disparar la petición
        cleanHtmxAttributes(clonedTarget);

        // 5. Reemplazar el marcador [hx-wrapper] por el clon del target
        marker.parentNode.replaceChild(clonedTarget, marker);

        // 6. Extraer el nodo raíz del envoltorio.
        //    Si el fragment tiene un solo hijo Element, lo usamos
        //    directamente; de lo contrario, envolvemos en un <div>.
        var wrapperNode;
        var childElements = wrapperFragment.querySelectorAll(":scope > *");

        if (childElements.length === 1) {
            wrapperNode = childElements[0];
        } else {
            // Múltiples nodos raíz: los envolvemos en un div neutro
            wrapperNode = document.createElement("div");
            while (wrapperFragment.firstChild) {
                wrapperNode.appendChild(wrapperFragment.firstChild);
            }
        }

        // 7. Reemplazar el target original en el DOM por el envoltorio
        target.parentNode.replaceChild(wrapperNode, target);

        // 8. Notificar a HTMX del nuevo árbol de elementos para que procese
        //    atributos hx-* que puedan existir dentro del envoltorio
        htmx.process(wrapperNode);
    }

    // ─── Registro del listener ──────────────────────────────────────────

    /**
     * Escuchamos el evento `htmx:beforeSwap` que se dispara justo antes
     * de que HTMX ejecute su lógica de swap. Si detectamos que el
     * swapStyle es "wrapper", prevenimos el comportamiento por defecto
     * y ejecutamos nuestra lógica personalizada.
     */
    document.addEventListener("htmx:beforeSwap", function (evt) {

        var detail = evt.detail;

        // Solo interceptamos si el estilo de swap es "wrapper"
        var swapStyle = getSwapStyle(detail);
        if (swapStyle !== SWAP_STYLE) {
            return;
        }

        // Prevenir el swap por defecto de HTMX
        detail.shouldSwap = false;

        // Obtener el target y el HTML del servidor
        var target     = detail.target;
        var serverHTML = detail.xhr.response;

        // Validar que tenemos un target válido en el DOM
        if (!target || !target.parentNode) {
            console.warn(
                "[" + EXTENSION_NAME + "] No se encontró un target válido " +
                "en el DOM para el swap de tipo '" + SWAP_STYLE + "'."
            );
            return;
        }

        // Validar que hay contenido del servidor
        if (!serverHTML || !serverHTML.trim()) {
            console.warn(
                "[" + EXTENSION_NAME + "] La respuesta del servidor está vacía."
            );
            return;
        }

        // Ejecutar el swap de tipo wrapper
        performWrapperSwap(target, serverHTML);
    });

    // Log de inicialización
    console.info("[" + EXTENSION_NAME + "] Extensión cargada correctamente.");

})();
