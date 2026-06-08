/**
 * Script IEEE Interno: CSS Selector Fallback
 * Proporciona un selector CSS estándar cuando el DSLL no es suficiente.
 */
(function() {
    const CONFIG = {
        id: "ieee_css_selector_lumo",
        nombre: "Capturar Selector CSS",
        descripcion: "Genera un selector CSS estándar como fallback",
        icono: "fa-solid fa-code",
        metodos: [
            { 
                nombre: "Activar Selector CSS", 
                funcionGlobal: "lumoCssSelectorInspector", 
                descripcion: "Copia el selector CSS del elemento al hacer clic" 
            }
        ]
    };

    localStorage.setItem(CONFIG.id, JSON.stringify(CONFIG));

    window.lumoCssSelectorInspector = function() {
        if (window.__inspectorActivo) {
            if (window.sileo) {
                window.sileo.info({ 
                    title: "Inspector en uso", 
                    description: "Ya hay un inspector activo. Ciérralo antes de cambiar de modo." 
                });
            }
            return;
        }

        let elementoActual = null;

        const estilo = document.createElement('style');
        estilo.id = 'css-fallback-styles';
        estilo.innerHTML = `
            .css-fallback-active * { cursor: crosshair !important; }
            .css-fallback-marker {
                position: fixed; pointer-events: none; z-index: 99998;
                box-sizing: border-box; border: 2px solid #4F46E5; /* Lumo Accent Dark */
                background: rgba(79, 70, 229, 0.1);
                border-radius: 4px; transition: all 0.1s ease-out;
            }
            #css-fallback-tooltip {
                position: fixed; pointer-events: none; z-index: 99999;
                background: #0B1142; color: #fff; padding: 8px 12px;
                border-radius: 1rem; font-family: 'SFMono-Regular', Consolas, monospace;
                font-size: 11px; font-weight: bold; border: 1px solid #1A237E;
                box-shadow: 0 10px 25px rgba(0,0,0,0.4); max-width: 350px; word-break: break-all;
            }
        `;
        document.head.appendChild(estilo);

        const tooltip = document.createElement('div');
        tooltip.id = 'css-fallback-tooltip';
        document.body.appendChild(tooltip);
        document.body.classList.add('css-fallback-active');

        function generateCSSSelector(el) {
            if (!(el instanceof Element)) return "";
            const path = [];
            while (el.nodeType === Node.ELEMENT_NODE) {
                let selector = el.nodeName.toLowerCase();
                if (el.id) {
                    selector += '#' + el.id;
                    path.unshift(selector);
                    break; // Un ID es único, terminamos aquí
                } else {
                    let sibling = el;
                    let nth = 1;
                    while (sibling = sibling.previousElementSibling) {
                        if (sibling.nodeName.toLowerCase() == selector) nth++;
                    }
                    if (nth != 1) selector += `:nth-of-type(${nth})`;
                }
                path.unshift(selector);
                el = el.parentNode;
            }
            return path.join(" > ");
        }

        function updateVisuals(e) {
            elementoActual = e.target;
            const selector = generateCSSSelector(elementoActual);
            
            // Actualizar Marcador
            let marker = document.querySelector('.css-fallback-marker');
            if (!marker) {
                marker = document.createElement('div');
                marker.className = 'css-fallback-marker';
                document.body.appendChild(marker);
            }
            const rect = elementoActual.getBoundingClientRect();
            marker.style.width = `${rect.width + 6}px`;
            marker.style.height = `${rect.height + 6}px`;
            marker.style.top = `${rect.top - 3}px`;
            marker.style.left = `${rect.left - 3}px`;

            // Actualizar Tooltip
            tooltip.textContent = selector;
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY + 15}px`;
        }

        async function finalizeCapture(e) {
            e.preventDefault(); e.stopPropagation();
            const selector = generateCSSSelector(e.target);
            try {
                await navigator.clipboard.writeText(selector);
                if (window.sileo) {
                    window.sileo.success({ title: "Selector CSS Copiado", description: selector });
                }
                window.desactivarCssInspector();
            } catch (err) {
                console.error("Error al copiar:", err);
            }
        }

        window.desactivarCssInspector = function() {
            document.removeEventListener('mouseover', updateVisuals, true);
            document.removeEventListener('click', finalizeCapture, true);
            document.body.classList.remove('css-fallback-active');
            document.querySelector('.css-fallback-marker')?.remove();
            document.getElementById('css-fallback-tooltip')?.remove();
            document.getElementById('css-fallback-styles')?.remove();
            window.__inspectorActivo = false;
        };

        window.__inspectorActivo = true;
        document.addEventListener('mouseover', updateVisuals, true);
        document.addEventListener('click', finalizeCapture, true);
        
        // Tecla escape para cancelar
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') window.desactivarCssInspector();
        }, { once: true });
    };

    console.log(`%c[IEEE] ${CONFIG.nombre} inicializado`, "color: #4F46E5; font-weight: bold;");
})();