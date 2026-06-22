/**
 * @file Generador Visual de Árbol de Directorios Dinámico
 * @description Escanea de forma recursiva una carpeta para pintar en consola una 
 * representación gráfica de las carpetas y archivos en formato de árbol.
 * Organiza el árbol poniendo siempre las carpetas primero y filtra elementos innecesarios.
 *
 * @usage
 * Puedes ejecutar este script desde la terminal de tres maneras:
 * * 1. Uso por Defecto (Escanea el directorio actual donde está el script):
 * $ node nombre-del-script.js
 * * 2. Ruta Relativa Personalizada:
 * $ node nombre-del-script.js src/componentes
 * * 3. Ruta Absoluta (Soporta arrastrar carpetas directamente a la terminal):
 * $ node nombre-del-script.js /Users/proyecto/mi-app
 *
 * @param {string} [process.argv[2]=__dirname] - Ruta de la carpeta que se desea escanear.
 */

const fs = require('fs');
const path = require('path');

// Carpetas que el script va a ignorar para no ensuciar el árbol
const IGNORE = new Set(['node_modules', '.git', '.DS_Store']);

// 1. Capturar la ruta desde la terminal (o usar la carpeta actual por defecto)
const rutaInput = process.argv[2] || __dirname;

// 2. Convertir a ruta absoluta segura
const carpetaObjetivo = path.isAbsolute(rutaInput) ? rutaInput : path.join(__dirname, rutaInput);

function generarArbol(dir, prefijo = '') {
    let resultado = '';

    // Validar primero si la carpeta realmente existe
    if (!fs.existsSync(dir)) {
        return `⚠️  Error: La ruta "${dir}" no existe.\n`;
    }

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

// Ejecutar e imprimir en la consola usando la carpeta seleccionada
if (fs.existsSync(carpetaObjetivo)) {
    const nombreCarpetaRaiz = path.basename(carpetaObjetivo);
    console.log(`\n📦 ${nombreCarpetaRaiz}/`);
    console.log(generarArbol(carpetaObjetivo));
} else {
    console.error(`\n❌ La carpeta especificada no existe: ${carpetaObjetivo}\n`);
}