const fs = require('fs');
const path = require('path');

// Carpetas que el script va a ignorar para no ensuciar el árbol
const IGNORE = new Set(['node_modules', '.git', '.DS_Store']);

function generarArbol(dir, prefijo = '') {
    let resultado = '';
    const items = fs.readdirSync(dir)
        .filter(item => !IGNORE.has(item))
        .sort((a, b) => {
            // Pone las carpetas primero y luego los archivos
            const aStat = fs.statSync(path.join(dir, a));
            const bStat = fs.statSync(path.join(dir, b));
            return bStat.isDirectory() - aStat.isDirectory();
        });

    items.forEach((item, index) => {
        const esUltimo = index === items.length - 1;
        const rutaCompleta = path.join(dir, item);
        const stat = fs.statSync(rutaCompleta);
        
        // Determinar el emoji según el tipo (Carpeta o Archivo)
        const emoji = stat.isDirectory() ? '📁 ' : '📄 ';

        // Símbolos visuales para las ramas del árbol
        const conector = esUltimo ? '└── ' : '├── ';
        
        // Unimos el conector, el emoji y el nombre del archivo/carpeta
        resultado += prefijo + conector + emoji + item + '\n';

        // Si es carpeta, hacemos la recursión para entrar en ella
        if (stat.isDirectory()) {
            const nuevoPrefijo = prefijo + (esUltimo ? '    ' : '│   ');
            resultado += generarArbol(rutaCompleta, nuevoPrefijo);
        }
    });

    return resultado;
}

// Ejecutar e imprimir en la consola
const nombreCarpetaRaiz = path.basename(__dirname);
console.log(`\n📦 ${nombreCarpetaRaiz}/`);
console.log(generarArbol(__dirname));