/**
 * Script IEEE: Limpiar Consola
 */
(function() {
    window.lumoClearConsole = function() {
        console.clear();
        if (window.sileo) {
            window.sileo.success({
                title: "Consola limpia",
                description: "Se han eliminado todos los registros del log."
            });
        }
    };

    const method = { 
        nombre: "Limpiar Consola", 
        icono: "fa-solid fa-broom",
        funcionGlobal: "lumoClearConsole", 
        descripcion: "Limpia la consola del navegador" 
    };

    // Registro en llave principal
    if (window.lumoRegisterUtility) {
        window.lumoRegisterUtility(method);
    } else {
        window.__lumoUtilityQueue = window.__lumoUtilityQueue || [];
        window.__lumoUtilityQueue.push(method);
    }
})();