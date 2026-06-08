(function() {
    // Prevenir inyecciones múltiples
    if (window.__lumoSidebarInitialized) return;
    window.__lumoSidebarInitialized = true;

    let sidebar = null;

    async function init() {
        const existing = document.getElementById('lumo-ieee-sidebar');
        if (existing) {
            sidebar = existing;
            return;
        }

        // 0. Limpiar el localStorage de herramientas IEEE para evitar elementos huérfanos
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ieee_')) {
                localStorage.removeItem(key);
            }
        });

        // 1. Cargar scripts internos antes de renderizar
        let scriptsToLoad = [];
        try {
            const response = await fetch(chrome.runtime.getURL('scripts/registry.json'));
            scriptsToLoad = await response.json();
        } catch (e) {
            console.error("IEEE: No se pudo cargar registry.json. Asegúrate de que exista.");
            return;
        }

        await loadInternalScripts(scriptsToLoad);

        // Inyectar estilos globales para Sileo.js (Mejora visibilidad en fondos claros)
        if (!document.getElementById('sileo-lumo-overrides')) {
            const style = document.createElement('style');
            style.id = 'sileo-lumo-overrides';
            style.innerHTML = `
                [data-sileo-toast] { filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.15)) !important; }
            `;
            document.head.appendChild(style);
        }

        // 2. Crear sidebar
        sidebar = document.createElement('div');
        sidebar.id = 'lumo-ieee-sidebar';
        sidebar.setAttribute('element-is', 'ieee-sidebar');
        sidebar.className = 'lumo-ieee-sidebar';
        
        // Agregar Header estilo Widget
        const header = document.createElement('div');
        header.className = 'ieee-sidebar-header';
        header.innerHTML = `
            <i class="fa-solid fa-microchip"></i>
            <span>IEEE</span>
            <button id="ieee-sync-btn" title="Sincronizar Herramientas">
                <i class="fa-solid fa-rotate"></i>
            </button>
        `;

        header.querySelector('#ieee-sync-btn').onclick = async (e) => {
            e.stopPropagation();
            console.log("%c[IEEE] 🔄 Iniciando sincronización con el servidor local...", "color: #6366F1; font-weight: bold;");

            const icon = e.currentTarget.querySelector('i');
            icon.classList.add('fa-spin');
            
            try {
                // Paso 1: Preparar
                const prepRes = await fetch('http://localhost:3000/api/sync/prepare', { method: 'POST' });
                const prepData = await prepRes.json();

                icon.classList.remove('fa-spin');
                
                // Delegar el Toast y su lógica al Main World vía Background
                chrome.runtime.sendMessage({
                    action: "sileo-sync-flow",
                    data: prepData
                });

            } catch (err) {
                console.error("IEEE: Error conectando al servidor de desarrollo.", err);
                icon.classList.remove('fa-spin');
                
                chrome.runtime.sendMessage({
                    action: "sileo-notify",
                    method: "error",
                    options: { 
                        title: "Error de Sync", 
                        description: "Servidor local desconectado." 
                    }
                });
            }
        };

        sidebar.appendChild(header);

        document.body.appendChild(sidebar);

        // Sincronización en tiempo real: Escuchar cambios en localStorage
        window.addEventListener('storage', (e) => {
            // Si se limpia el storage (key null) o cambia una llave de IEEE, refrescamos
            if (e.key === null || (e.key && e.key.startsWith('ieee_'))) {
                renderTools();
            }
        });

        renderTools();

        // Sincronización proactiva: Polling cada 1s para detectar cambios internos
        let lastStateHash = "";
        setInterval(() => {
            if (!sidebar || !sidebar.classList.contains('active')) return;

            // Generamos un hash rápido del estado actual de las herramientas IEEE
            const currentIeeeState = Object.keys(localStorage)
                .filter(k => k.startsWith('ieee_'))
                .sort()
                .map(k => k + localStorage.getItem(k))
                .join('|');

            // Si el estado ha cambiado (nuevas herramientas, eliminadas o modificadas), refrescamos
            if (currentIeeeState !== lastStateHash) {
                lastStateHash = currentIeeeState;
                renderTools();
            }
        }, 1000);
    }

    async function loadInternalScripts(scripts) {
        // Carga secuencial para respetar dependencias (sileo primero)
        for (const scriptName of scripts) {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = chrome.runtime.getURL(`scripts/${scriptName}`);
                script.onload = resolve;
                script.onerror = () => {
                    console.error(`IEEE: Error al cargar ${scriptName}`);
                    resolve(); 
                };
                (document.head || document.documentElement).appendChild(script);
            });
        }
    }

    function renderTools() {
        if (!sidebar) return;

        // Limpiar solo los contenedores de herramientas, no el header
        const tools = sidebar.querySelectorAll('.ieee-tool-container');
        tools.forEach(t => t.remove());
        
        // Buscar en localStorage claves ieee_
        const keys = Object.keys(localStorage).filter(k => k.startsWith('ieee_'));
        
        keys.forEach(key => {
            try {
                const config = JSON.parse(localStorage.getItem(key));
                createToolElement(config);
            } catch (e) {
                console.error(`Error parseando IEEE en ${key}:`, e);
            }
        });
    }

    function createToolElement(config) {
        const container = document.createElement('div');
        container.className = 'ieee-tool-container';
        
        const btn = document.createElement('button');
        btn.className = 'ieee-btn-main';
        btn.setAttribute('element-is', 'ieee-tool-btn');
        btn.setAttribute('data-name', config.nombre);
        btn.innerHTML = `<i class="${config.icono || 'fas fa-cog'}"></i>`;

        if (config.metodos && config.metodos.length === 1) {
            // Acción directa
            btn.onclick = () => executeInPageContext(config.metodos[0].funcionGlobal);
        } else if (config.metodos && config.metodos.length > 1) {
            // Dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'ieee-dropdown';
            dropdown.setAttribute('element-is', 'ieee-context-menu');

            config.metodos.forEach(metodo => {
                const item = document.createElement('button');
                item.className = 'ieee-method-item';
                
                // Soporte para iconos en los items del dropdown
                const iconHtml = metodo.icono ? `<i class="${metodo.icono}"></i>` : '';
                item.innerHTML = `${iconHtml}<span>${metodo.nombre}</span>`;
                
                item.onclick = () => {
                    executeInPageContext(metodo.funcionGlobal);
                    dropdown.classList.remove('show');
                };
                dropdown.appendChild(item);
            });

            btn.onclick = (e) => {
                e.stopPropagation();
                // Cerrar otros dropdowns
                document.querySelectorAll('.ieee-dropdown').forEach(d => {
                    if(d !== dropdown) d.classList.remove('show');
                });
                dropdown.classList.toggle('show');
            };
            container.appendChild(dropdown);
        }

        container.appendChild(btn);
        sidebar.appendChild(container);
    }

    /**
     * Ejecuta una función en el contexto global de la página
     * Enviando un mensaje al background para inyección segura (MV3).
     */
    function executeInPageContext(fnString) {
        try {
            chrome.runtime.sendMessage({ 
                action: "execute-script", 
                fnString: fnString 
            });
        } catch (e) {
            if (e.message.includes("context invalidated")) {
                console.warn("%c[IEEE] ⚠️ Extensión recargada. El puente de comunicación se ha roto.", "color: #F59E0B; font-weight: bold;");
                
                // Usamos el puente para mostrar el error de sesión caducada
                chrome.runtime.sendMessage({
                    action: "sileo-notify",
                    method: "error",
                    options: {
                        title: "Sesión Caducada",
                        description: "Herramientas actualizadas. Debes refrescar la página.",
                        shouldReload: true
                    }
                });
            } else {
                console.error("IEEE Error:", e);
            }
        }
    }

    // Listener para mensajes del background (Toggle)
    chrome.runtime.onMessage.addListener(async (request) => {
        if (request.action === "toggle-sidebar") {
            if (!sidebar) {
                await init();
                // Forzar un reflow para que el navegador registre la posición inicial (-150%)
                // antes de aplicar la clase que dispara la transición.
                if (sidebar) void sidebar.offsetWidth;
            } else {
                // Solo recargar herramientas si la barra se va a abrir
                if (!sidebar.classList.contains('active')) renderTools();
            }

            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        }
    });

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', () => {
        document.querySelectorAll('.ieee-dropdown').forEach(d => d.classList.remove('show'));
    });

})();