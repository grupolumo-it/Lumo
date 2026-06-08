/**
 * Script IEEE: Lumo Console Watcher
 */
(function() {
    // Captura segura de métodos originales
    const original = window.__lumoOriginalConsole || {
        log: console.log, info: console.info, warn: console.warn, error: console.error
    };
    window.__lumoOriginalConsole = original;

    window.__lumoConsoleWatcherActive = false;


    function getOrCreateColorClass(color) {
        const safeColor = color.replace(/[^a-z0-9]/gi, '');
        const className = `lumo-watcher-txt-${safeColor}`;
        if (!document.getElementById(className)) {
            const style = document.createElement('style');
            style.id = className;
            style.innerHTML = `.${className} { color: ${color} !important; font-weight: 600; }`;
            document.head.appendChild(style);
        }
        return className;
    }

    function processConsoleArgs(args) {
        let firstArg = args[0];
        let description = "";
        let textColorClass = "";

        if (typeof firstArg === 'string' && firstArg.includes('%c')) {
            const formatCount = (firstArg.match(/%c/g) || []).length;
            const styleArgs = args.slice(1, 1 + formatCount);
            const contentArgs = args.slice(1 + formatCount);

            for (let style of styleArgs) {
                if (typeof style === 'string' && style.toLowerCase().includes('color:')) {
                    const match = style.match(/color:\s*([^;]+)/i);
                    if (match) {
                        textColorClass = getOrCreateColorClass(match[1].trim());
                        break; 
                    }
                }
            }

            description = firstArg.replace(/%c/g, '') + " " + contentArgs.map(a => 
                typeof a === 'object' ? JSON.stringify(a) : String(a)
            ).join(' ');
        } else {
            description = args.map(a => 
                typeof a === 'object' ? JSON.stringify(a) : String(a)
            ).join(' ');
        }

        const finalDesc = description.length > 150 ? description.substring(0, 147) + "..." : description;
        return { description: finalDesc, textColorClass };
    }

    window.lumoToggleConsoleWatcher = function() {
        if (!window.sileo) return;

        window.__lumoConsoleWatcherActive = !window.__lumoConsoleWatcherActive;

        if (window.__lumoConsoleWatcherActive) {
            console.log = (...args) => {
                original.log.apply(console, args);
                const { description, textColorClass } = processConsoleArgs(args);
                window.sileo.show({ title: "Console Log", description, styles: { description: textColorClass } });
            };
            console.info = (...args) => {
                original.info.apply(console, args);
                const { description, textColorClass } = processConsoleArgs(args);
                window.sileo.info({ title: "Console Info", description, styles: { description: textColorClass } });
            };
            console.warn = (...args) => {
                original.warn.apply(console, args);
                const { description, textColorClass } = processConsoleArgs(args);
                window.sileo.warning({ title: "Console Warning", description, styles: { description: textColorClass } });
            };
            console.error = (...args) => {
                original.error.apply(console, args);
                const { description, textColorClass } = processConsoleArgs(args);
                window.sileo.error({ title: "Console Error", description, styles: { description: textColorClass } });
            };

            window.sileo.success({ title: "Watcher Activo", description: "Los logs aparecerán como notificaciones." });
        } else {
            console.log = original.log;
            console.info = original.info;
            console.warn = original.warn;
            console.error = original.error;

            window.sileo.info({ title: "Watcher Desactivado", description: "La consola ha vuelto a su estado normal." });
        }
        register();
    };

    function register() {
        const method = { 
            nombre: window.__lumoConsoleWatcherActive ? "Desactivar Watcher" : "Activar Watcher", 
            icono: window.__lumoConsoleWatcherActive ? "fa-solid fa-eye-slash" : "fa-solid fa-eye",
            funcionGlobal: "lumoToggleConsoleWatcher", 
            descripcion: "Muestra logs de consola en notificaciones" 
        };
        if (window.lumoRegisterUtility) {
            window.lumoRegisterUtility(method);
        } else {
            window.__lumoUtilityQueue = window.__lumoUtilityQueue || [];
            window.__lumoUtilityQueue.push(method);
        }
    }

    register();
})();