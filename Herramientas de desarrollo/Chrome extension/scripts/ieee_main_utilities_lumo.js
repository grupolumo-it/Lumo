/**
 * Script IEEE: Lumo Main Utilities Manager
 * Se encarga de la llave principal y el registro centralizado de métodos.
 */
(function() {
    const KEY = "ieee_utilities_main";
    const CONFIG = {
        id: KEY,
        nombre: "Utilidades",
        descripcion: "Herramientas de limpieza y log de Lumo",
        icono: "fa-solid fa-screwdriver-wrench",
        metodos: []
    };

    // Inicializar la llave si no existe para que el Sidebar la reconozca
    if (!localStorage.getItem(KEY)) {
        localStorage.setItem(KEY, JSON.stringify(CONFIG));
    }

    /**
     * Función global para recibir métodos de otros scripts IEEE.
     */
    window.lumoRegisterUtility = function(method) {
        const stored = JSON.parse(localStorage.getItem(KEY)) || CONFIG;
        const index = stored.metodos.findIndex(m => m.funcionGlobal === method.funcionGlobal);
        
        if (index !== -1) {
            stored.metodos[index] = method;
        } else {
            stored.metodos.push(method);
        }
        localStorage.setItem(KEY, JSON.stringify(stored));
    };

    // Procesar cola de registros si otros scripts cargaron antes que este
    if (window.__lumoUtilityQueue) {
        window.__lumoUtilityQueue.forEach(m => window.lumoRegisterUtility(m));
        delete window.__lumoUtilityQueue;
    }

    console.log("%c[IEEE] Main Utilities: Sistema de registro listo", "color: #6366F1; font-weight: bold;");
})();