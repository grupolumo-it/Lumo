/**
 * Script IEEE: Debug Lumo
 */
(function() {
    window.lumoDebugDOM = function() {
        const components = document.querySelectorAll('[element-is]');
        const msg = `Se han encontrado ${components.length} componentes DSL en la página.`;
        console.log(`%c[Lumo Debug] ${msg}`, "color: #1A237E; font-weight: bold;");
        
        if (window.sileo) {
            window.sileo.info({
                title: "Lumo Debug",
                description: msg
            });
        }
    };

    const method = { 
        nombre: "Debug Lumo", 
        icono: "fa-solid fa-bug",
        funcionGlobal: "lumoDebugDOM", 
        descripcion: "Muestra estado del DOM" 
    };

    // Registro en llave principal
    if (window.lumoRegisterUtility) {
        window.lumoRegisterUtility(method);
    } else {
        window.__lumoUtilityQueue = window.__lumoUtilityQueue || [];
        window.__lumoUtilityQueue.push(method);
    }
})();