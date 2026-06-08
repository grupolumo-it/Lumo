/**
 * Script IEEE Interno: Lumo Inspector Bridge
 * Este script se registra automáticamente al ser cargado por la extensión.
 */
(function() {
    // 1. CONFIGURACIÓN IEEE
    const CONFIG = {
        id: "ieee_DSL_lumo",
        nombre: "Buscar ruta DSL by Lumo - DSLL",
        descripcion: "Localizador de componentes DSLL",
        icono: "fa-solid fa-magnifying-glass",
        metodos: [
            { 
                nombre: "Activar Inspector", 
                icono: "fa-solid fa-crosshairs",
                funcionGlobal: "lumoInspector", 
                descripcion: "Inicia el inspector de elementos" 
            }
        ]
    };

    // Registrar en el sistema
    localStorage.setItem(CONFIG.id, JSON.stringify(CONFIG));

    // 2. LÓGICA DEL INSPECTOR (Adaptada de Inspector.js)
    
    window.lumoInspector = function() {
        if (window.__inspectorActivo) {
            if (window.sileo) {
                window.sileo.info({
                    title: "Inspector activo",
                    description: "El inspector ya se encuentra en ejecución."
                });
            } else {
                console.warn('El inspector ya está en ejecución.');
            }
            return;
        }

        let elementoActual = null;
        let seleccionMultiple = [];
        let ultimoTextoDSL = "Explora los componentes...";

        // Inyectar estilos
        const estiloCursor = document.createElement('style');
        estiloCursor.id = 'inspector-estilos-globales';
        estiloCursor.innerHTML = `
            @keyframes inspector-bounce-in {
                0% { opacity: 0; transform: scale(0.3); }
                70% { opacity: 1; transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            @keyframes inspector-tooltip-in {
                from { opacity: 0; transform: translateY(10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .inspector-en-uso { user-select: none !important; }
            .inspector-en-uso * { cursor: crosshair !important; }
            .inspector-marker {
                position: fixed; pointer-events: none; z-index: 99998;
                box-sizing: border-box; transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); 
                border-style: solid;
                animation: inspector-bounce-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #inspector-tooltip {
                position: fixed; pointer-events: none; z-index: 99999;
                background: rgba(11, 17, 66, 0.95); /* Lumo Navy */
                color: #fff; padding: 8px 12px; border-radius: 8px;
                transition: opacity 0.3s ease, transform 0.3s ease, left 0.15s ease-out, top 0.15s ease-out;
                font-family: 'Comfortaa', cursive, monospace; font-size: 12px;
                font-weight: bold;
                border: 1px solid #1A237E; box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                max-width: 400px; word-break: break-all; 
                display: block; opacity: 0; border-radius: 1rem;
            }
        `;
        document.head.appendChild(estiloCursor);

        const tooltip = document.createElement('div');
        tooltip.id = 'inspector-tooltip';
        tooltip.textContent = ultimoTextoDSL;
        document.body.appendChild(tooltip);
        document.body.classList.add('inspector-en-uso');

        // --- Motor DSL ---
        function analizarElemento(el) {
            if (!el) return null;
            const tag = el.tagName.toLowerCase();
            const atributoCustom = el.getAttribute('element-is');
            const identificadorHijo = atributoCustom ? `$${atributoCustom.replace(/^\$/, '')}` : tag;

            if (el.id) return { tagHijo: tag, id: el.id, soloID: true };

            let padre = el.parentElement;
            while (padre && !padre.id) { padre = padre.parentElement; }

            if (!padre) return { tagPadre: 'body', idPadre: null, relacion: '>>', identificadorHijo, tagHijo: tag, index: 0, grupoHermanos: [el] };

            const tagPadre = padre.tagName.toLowerCase();
            const idPadre = padre.id;
            const relacion = (el.parentElement === padre) ? '>' : '>>';
            const selector = atributoCustom ? `[element-is="${atributoCustom}"]` : `${tag}:not([element-is])`;

            let grupoHermanos;
            if (relacion === '>') {
                grupoHermanos = Array.from(padre.children).filter(child => {
                    const childAttr = child.getAttribute('element-is');
                    return atributoCustom ? childAttr === atributoCustom : (child.tagName.toLowerCase() === tag && !childAttr);
                });
            } else {
                grupoHermanos = Array.from(padre.querySelectorAll(selector));
            }

            return { tagPadre, idPadre, relacion, identificadorHijo, tagHijo: tag, grupoHermanos, el };
        }

        function generarSintaxis(elementos) {
            if (!Array.isArray(elementos)) elementos = [elementos];
            if (elementos.length === 0) return "";
            const info = analizarElemento(elementos[0]);
            if (info.soloID) return `${info.tagHijo} #${info.id}`;
            if (!info.idPadre && info.tagPadre === 'body') return `${info.tagHijo} (1) ${info.identificadorHijo}`;

            const indices = elementos.map(el => info.grupoHermanos.indexOf(el)).filter(idx => idx !== -1).sort((a, b) => a - b);
            const operadorIndice = agruparIndicesEnDSL(indices, info.grupoHermanos.length);
            return `${info.tagPadre} #${info.idPadre} ${info.relacion} ${operadorIndice} ${info.identificadorHijo}`;
        }

        function agruparIndicesEnDSL(indices, total) {
            indices = [...new Set(indices)].map(idx => idx + 1).sort((a, b) => a - b);
            if (indices.length === 0) return "(1)";
            if (indices.length === total) return "(ALL)";
            const chunks = [];
            for (let i = 0; i < indices.length; i++) {
                let start = indices[i];
                let end = start;
                while (i + 1 < indices.length && indices[i + 1] === end + 1) { end = indices[++i]; }
                if (start === end) {
                    if (start === 1) chunks.push("FIRST");
                    else if (start === total) chunks.push("LAST");
                    else chunks.push(start);
                } else {
                    const s = (start === 1) ? "UPTO" : start;
                    const e = (end === total) ? "END" : end;
                    chunks.push(`${s}..${e}`);
                }
            }
            return `(${chunks.join(';')})`;
        }

        function sonCompatibles(el1, el2) {
            if (!el1 || !el2) return false;
            const a = analizarElemento(el1), b = analizarElemento(el2);
            return a.idPadre === b.idPadre && a.relacion === b.relacion && a.identificadorHijo === b.identificadorHijo;
        }

        // --- Visuals ---
        function renderizarResaltes() {
            document.querySelectorAll('.inspector-marker').forEach(m => m.remove());
            seleccionMultiple.forEach(el => crearMarcador(el, true));
            if (elementoActual && !seleccionMultiple.includes(elementoActual)) crearMarcador(elementoActual, false);
        }

        function crearMarcador(el, esSeleccion = false) {
            if (!el) return;
            const marker = document.createElement('div');
            marker.className = 'inspector-marker';
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            const offset = esSeleccion ? 6 : 3;

            if (esSeleccion) {
                marker.style.borderColor = '#10B981'; // Success Lumo
                marker.style.borderWidth = '3px';
                marker.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
            } else {
                marker.style.borderColor = '#4F46E5'; // Accent Lumo
                marker.style.borderWidth = '2px';
            }

            marker.style.borderRadius = style.borderRadius;
            marker.style.width = `${rect.width + (offset * 2)}px`;
            marker.style.height = `${rect.height + (offset * 2)}px`;
            marker.style.top = `${rect.top - offset}px`;
            marker.style.left = `${rect.left - offset}px`;
            document.body.appendChild(marker);
        }

        function actualizarTooltip(e, texto) {
            if (!tooltip) return;
            if (tooltip.style.opacity !== '1') {
                tooltip.style.opacity = '1';
                tooltip.style.animation = 'inspector-tooltip-in 0.3s ease-out forwards';
            }
            
            tooltip.textContent = texto;
            let x = e.clientX + 15, y = e.clientY + 15;
            if (x + tooltip.offsetWidth > window.innerWidth) x = e.clientX - tooltip.offsetWidth - 15;
            if (y + tooltip.offsetHeight > window.innerHeight) y = e.clientY - tooltip.offsetHeight - 15;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }

        // --- Eventos ---
        function alMoverMouse(e) {
            e.stopPropagation();
            elementoActual = e.target;
            renderizarResaltes();
            ultimoTextoDSL = (seleccionMultiple.length > 0 && e.shiftKey && sonCompatibles(seleccionMultiple[0], elementoActual))
                ? generarSintaxis([...seleccionMultiple, elementoActual])
                : generarSintaxis(seleccionMultiple.length > 0 ? seleccionMultiple : elementoActual);
            actualizarTooltip(e, ultimoTextoDSL);
        }

        function alDesplazarMouse(e) {
            actualizarTooltip(e, ultimoTextoDSL);
        }

        function alPresionarTecla(e) {
            // Cancelar el inspector al presionar Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                window.desactivarInspector();
                return;
            }

            if (!e.shiftKey) return;
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault(); e.stopPropagation();
                if (!elementoActual) return;
                let siguiente = (e.key === 'ArrowUp') ? elementoActual.parentElement : elementoActual.firstElementChild;
                if (siguiente) {
                    elementoActual = siguiente;
                    renderizarResaltes();
                    const rect = elementoActual.getBoundingClientRect();
                    actualizarTooltip({ clientX: rect.left, clientY: rect.top }, generarSintaxis(elementoActual));
                }
            }
        }

        async function alHacerClick(e) {
            e.preventDefault(); e.stopPropagation();
            if (!elementoActual) return;

            if (e.shiftKey) {
                if (seleccionMultiple.length > 0 && !sonCompatibles(seleccionMultiple[0], elementoActual)) {
                    seleccionMultiple = [elementoActual];
                } else {
                    const idx = seleccionMultiple.indexOf(elementoActual);
                    if (idx > -1) seleccionMultiple.splice(idx, 1);
                    else seleccionMultiple.push(elementoActual);
                }
                renderizarResaltes();
                actualizarTooltip(e, generarSintaxis(seleccionMultiple));
                return;
            }

            const dsl = generarSintaxis(seleccionMultiple.length > 0 ? seleccionMultiple : elementoActual);
            try {
                await navigator.clipboard.writeText(dsl);
                renderizarResaltes();
                
                if (window.sileo) {
                    window.sileo.success({
                        title: "Sintaxis DSL Copiada",
                        description: dsl
                    });
                } else {
                    alert(`Copiado: ${dsl}`);
                }

                window.desactivarInspector();
            } catch (err) { console.error(err); window.desactivarInspector(); }
        }

        // --- Global de Desactivación ---
        window.desactivarInspector = function() {
            // Desactivar listeners inmediatamente
            document.removeEventListener('mouseover', alMoverMouse, true);
            document.removeEventListener('mousemove', alDesplazarMouse, true);
            document.removeEventListener('keydown', alPresionarTecla, true);
            document.removeEventListener('click', alHacerClick, true);

            const markers = document.querySelectorAll('.inspector-marker');
            const tooltipEl = document.getElementById('inspector-tooltip');
            const estilos = document.getElementById('inspector-estilos-globales');

            // Aplicar efectos de salida
            if (tooltipEl) {
                tooltipEl.style.opacity = "0";
                tooltipEl.style.transform = "translateY(10px) scale(0.9)";
            }
            markers.forEach(m => {
                m.style.opacity = "0";
                m.style.transform = "scale(1.1)";
            });

            // Limpiar el DOM después de la animación
            setTimeout(() => {
                document.body.classList.remove('inspector-en-uso');
                markers.forEach(m => m.remove());
                if (tooltipEl) tooltipEl.remove();
                if (estilos) estilos.remove();
                window.__inspectorActivo = false;
                console.log('%c[Inspector] Desactivado.', 'color: gray;');
            }, 200);
        };

        // --- Inicio ---
        window.__inspectorActivo = true;
        document.addEventListener('mouseover', alMoverMouse, true);
        document.addEventListener('mousemove', alDesplazarMouse, true);
        document.addEventListener('keydown', alPresionarTecla, true);
        document.addEventListener('click', alHacerClick, true);
        console.log('%c[Lumo Inspector] Activo 🔍', 'color: #1A237E; font-weight: bold;');
    };

    // Stub para el botón de desactivar si no se ha activado aún
    if (!window.desactivarInspector) {
        window.desactivarInspector = () => {
            if (window.__inspectorActivo) {
                // La función real se define dentro de lumoInspector
                // Si llegamos aquí es porque algo falló, forzamos limpieza
                document.body.classList.remove('inspector-en-uso');
                document.querySelectorAll('.inspector-marker').forEach(m => m.remove());
                window.__inspectorActivo = false;
            }
        };
    }

    // El script solo se registra, NO se auto-ejecuta. 
    // La activación depende exclusivamente de la Sidebar.
    console.log(`%c[IEEE] ${CONFIG.nombre} registrado y listo`, "color: #10B981; font-weight: bold;");
})();