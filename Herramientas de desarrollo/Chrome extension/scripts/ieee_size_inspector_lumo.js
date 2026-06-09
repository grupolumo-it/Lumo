/**
 * Script IEEE Interno: Lumo Size Inspector
 * Mide dimensiones de componentes en píxeles. Utiliza la lógica de navegación del Inspector DSLL.
 */
(function() {
    const CONFIG = {
        id: "ieee_size_inspector_lumo",
        nombre: "Capturar Tamaño (PX)",
        descripcion: "Mide dimensiones de componentes en píxeles",
        icono: "fa-solid fa-ruler-combined",
        metodos: [
            { 
                nombre: "Activar Medidor", 
                icono: "fa-solid fa-maximize",
                funcionGlobal: "lumoSizeInspector", 
                descripcion: "Copia el tamaño (Ancho x Alto) del elemento" 
            }
        ]
    };

    localStorage.setItem(CONFIG.id, JSON.stringify(CONFIG));

    window.lumoSizeInspector = function() {
        if (window.__inspectorActivo) {
            if (window.sileo) {
                window.sileo.info({
                    title: "Inspector activo",
                    description: "Ya hay un inspector en ejecución. Ciérralo antes de cambiar de modo."
                });
            }
            return;
        }

        let elementoActual = null;
        let ultimoTextoSize = "Explora para medir...";

        const estilos = document.createElement('style');
        estilos.id = 'size-inspector-estilos';
        estilos.innerHTML = `
            .size-inspector-active * { cursor: crosshair !important; }
            .size-inspector-marker {
                position: fixed; pointer-events: none; z-index: 99998;
                box-sizing: border-box; border: 2px solid #10B981; /* Lumo Success */
                background: rgba(16, 185, 129, 0.1);
                transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                animation: inspector-bounce-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #size-inspector-tooltip {
                position: fixed; pointer-events: none; z-index: 99999;
                background: rgba(6, 78, 59, 0.95); color: #fff; padding: 8px 12px;
                border-radius: 1rem; font-family: 'Comfortaa', sans-serif; font-size: 12px;
                font-weight: bold; border: 1px solid #059669;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4); max-width: 400px;
                display: block; opacity: 0;
            }
            @keyframes size-tooltip-in {
                from { opacity: 0; transform: translateY(10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes inspector-bounce-in {
                0% { opacity: 0; transform: scale(0.3); }
                70% { opacity: 1; transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(estilos);

        const tooltip = document.createElement('div');
        tooltip.id = 'size-inspector-tooltip';
        document.body.appendChild(tooltip);
        document.body.classList.add('size-inspector-active');

        function obtenerDimensiones(el) {
            if (!el || !(el instanceof Element)) return "";
            const rect = el.getBoundingClientRect();
            return `${Math.round(rect.width)}px x ${Math.round(rect.height)}px`;
        }

        function renderizarResalte() {
            document.querySelectorAll('.size-inspector-marker').forEach(m => m.remove());
            if (!elementoActual) return;

            const marker = document.createElement('div');
            marker.className = 'size-inspector-marker';
            const rect = elementoActual.getBoundingClientRect();
            const style = window.getComputedStyle(elementoActual);

            marker.style.borderRadius = style.borderRadius;
            marker.style.width = `${rect.width + 6}px`;
            marker.style.height = `${rect.height + 6}px`;
            marker.style.top = `${rect.top - 3}px`;
            marker.style.left = `${rect.left - 3}px`;
            document.body.appendChild(marker);
        }

        function actualizarTooltip(e, texto) {
            if (!tooltip) return;
            if (tooltip.style.opacity !== '1') {
                tooltip.style.opacity = '1';
                tooltip.style.animation = 'size-tooltip-in 0.3s ease-out forwards';
            }
            
            tooltip.textContent = texto;
            let x = e.clientX + 15, y = e.clientY + 15;
            if (x + tooltip.offsetWidth > window.innerWidth) x = e.clientX - tooltip.offsetWidth - 15;
            if (y + tooltip.offsetHeight > window.innerHeight) y = e.clientY - tooltip.offsetHeight - 15;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }

        function alMoverMouse(e) {
            e.stopPropagation();
            elementoActual = e.target;
            renderizarResalte();
            ultimoTextoSize = obtenerDimensiones(elementoActual);
            actualizarTooltip(e, ultimoTextoSize);
        }

        function alDesplazarMouse(e) {
            actualizarTooltip(e, ultimoTextoSize);
        }

        function alPresionarTecla(e) {
            if (e.key === 'Escape') {
                window.desactivarSizeInspector();
                return;
            }

            if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault(); e.stopPropagation();
                if (!elementoActual) return;
                let siguiente = (e.key === 'ArrowUp') ? elementoActual.parentElement : elementoActual.firstElementChild;
                if (siguiente && siguiente !== document.documentElement) {
                    elementoActual = siguiente;
                    renderizarResalte();
                    ultimoTextoSize = obtenerDimensiones(elementoActual);
                    const rect = elementoActual.getBoundingClientRect();
                    actualizarTooltip({ clientX: rect.left, clientY: rect.top }, ultimoTextoSize);
                }
            }
        }

        async function alHacerClick(e) {
            e.preventDefault(); e.stopPropagation();
            if (!elementoActual) return;

            const sizeText = obtenerDimensiones(elementoActual);
            try {
                await navigator.clipboard.writeText(sizeText);
                if (window.sileo) {
                    window.sileo.success({
                        title: "Tamaño Copiado",
                        description: sizeText
                    });
                }
                window.desactivarSizeInspector();
            } catch (err) {
                console.error("Error al copiar:", err);
                window.desactivarSizeInspector();
            }
        }

        window.desactivarSizeInspector = function() {
            document.removeEventListener('mouseover', alMoverMouse, true);
            document.removeEventListener('mousemove', alDesplazarMouse, true);
            document.removeEventListener('keydown', alPresionarTecla, true);
            document.removeEventListener('click', alHacerClick, true);
            
            document.body.classList.remove('size-inspector-active');
            document.querySelectorAll('.size-inspector-marker').forEach(m => m.remove());
            document.getElementById('size-inspector-tooltip')?.remove();
            document.getElementById('size-inspector-estilos')?.remove();
            window.__inspectorActivo = false;
            console.log('%c[Size Inspector] Desactivado.', 'color: gray;');
        };

        window.__inspectorActivo = true;
        document.addEventListener('mouseover', alMoverMouse, true);
        document.addEventListener('mousemove', alDesplazarMouse, true);
        document.addEventListener('keydown', alPresionarTecla, true);
        document.addEventListener('click', alHacerClick, true);
        console.log('%c[Size Inspector] Activo 📏', 'color: #10B981; font-weight: bold;');
    };
})();