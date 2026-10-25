/**
 * @file Opciones de Ejecución del Generador de Rutas
 * @description Este script escanea una carpeta de páginas, detecta subcarpetas con archivos 'index.html'
 * y genera o actualiza un archivo JSON de mapeo de rutas compatible con el enrutador HTMX.
 * Mantiene intactas las modificaciones manuales previas en el JSON.
 *
 * @usage
 * Puedes ejecutar este script desde la terminal de tres maneras:
 * * 1. Uso por Defecto (Entrada: 'Pages', Salida: 'js/rutas.json'):
 * $ node scripts/generar-rutas.js
 * * 2. Rutas Relativas Personalizadas:
 * $ node scripts/generar-rutas.js src/paginas public/config/rutas.json
 * * 3. Rutas Absolutas (Soporta arrastrar carpetas a la terminal):
 * $ node scripts/generar-rutas.js /Users/proyecto/vistas /Users/proyecto/dist/rutas.json
 *
 * Las rutas relativas se resuelven desde la raíz del sitio (la carpeta que
 * contiene "scripts"), no desde la carpeta del propio script.
 *
 * @param {string} [process.argv[2]='Pages'] - Carpeta origen que contiene las subcarpetas de las páginas.
 * @param {string} [process.argv[3]='js/rutas.json'] - Ruta y nombre del archivo JSON que se creará o actualizará.
 */

const fs = require('fs');
const path = require('path');

// 1. Capturar argumentos desde la terminal (o usar valores por defecto)
// Uso: node scripts/generar-rutas.js [carpetaOrigen] [archivoSalida]
const carpetaEntradaInput = process.argv[2] || 'Pages';
const archivoSalidaInput = process.argv[3] || 'js/rutas.json';

// 2. Convertir a rutas absolutas seguras.
// La base es la raíz del sitio (la carpeta que contiene "scripts"), de modo que
// las rutas relativas funcionen sin depender del directorio desde el que se
// ejecute el script.
const baseProyecto = path.resolve(__dirname, '..');
const pagesDir = path.isAbsolute(carpetaEntradaInput) ? carpetaEntradaInput : path.join(baseProyecto, carpetaEntradaInput);
const outputFile = path.isAbsolute(archivoSalidaInput) ? archivoSalidaInput : path.join(baseProyecto, archivoSalidaInput);

// Obtenemos el nombre base de la carpeta padre (ej: 'Pages' o 'src/vistas' -> 'vistas')
const nombreCarpetaPadre = path.basename(pagesDir);

/**
 * Detecta si una página es un documento HTML completo (autónomo) o un
 * fragmento pensado para inyectarse con HTMX.
 * Un documento completo se sirve como página entera; un fragmento, dentro
 * del contenedor "#main-container" de la maqueta.
 *
 * @param {string} archivoHtml - Ruta absoluta al index.html de la página.
 * @returns {boolean} true si es un documento HTML completo.
 */
function esDocumentoCompleto(archivoHtml) {
    try {
        const inicio = fs.readFileSync(archivoHtml, 'utf8').slice(0, 500).toLowerCase();
        return inicio.includes('<!doctype html');
    } catch (error) {
        return false;
    }
}

function generarMapaRutas() {
    let mapaRutas = {};

    try {
        console.log(`> Procesando carpeta origen: ${pagesDir}`);
        console.log(`> Archivo de salida destino: ${outputFile}\n`);

        // Si el archivo ya existe, leer su contenido actual para NO borrarlo
        if (fs.existsSync(outputFile)) {
            const contenidoActual = fs.readFileSync(outputFile, 'utf8');
            if (contenidoActual.trim()) {
                mapaRutas = JSON.parse(contenidoActual);
            }
        }

        if (!fs.existsSync(pagesDir)) {
            console.error(`Error: La carpeta origen "${pagesDir}" no existe.`);
            return;
        }

        // Leer las carpetas internas
        const carpetas = fs.readdirSync(pagesDir);

        carpetas.forEach(carpeta => {
            const rutaCarpeta = path.join(pagesDir, carpeta);

            if (fs.statSync(rutaCarpeta).isDirectory()) {
                const archivoHtml = path.join(rutaCarpeta, 'index.html');

                if (fs.existsSync(archivoHtml)) {
                    const clave = `#${carpeta}`;

                    // Ahora la ruta relativa se adapta dinámicamente a la carpeta padre indicada
                    const rutaRelativa = `${nombreCarpetaPadre}/${carpeta}/index.html`;

                    // SOLO agregamos el objeto si NO existe ya en el archivo
                    if (!mapaRutas[clave]) {
                        if (esDocumentoCompleto(archivoHtml)) {
                            // Página autónoma (login, detalle de producto...):
                            // se sirve como documento HTML completo, no como fragmento.
                            mapaRutas[clave] = {
                                archivo: rutaRelativa,
                                "hx-get": rutaRelativa,
                                "pagina": true
                            };
                        } else {
                            // Fragmento HTMX: se inyecta dentro del contenedor de la maqueta.
                            // "hx-get" debe ser RELATIVO (sin "/" inicial): en GitHub Pages
                            // el proyecto vive en /<repo>/, y una ruta absoluta rompería
                            // la resolución de URLs.
                            // El swap es "innerHTML" para que el contenedor #main-container
                            // del layout se conserve entre navegaciones.
                            mapaRutas[clave] = {
                                archivo: rutaRelativa,
                                "hx-get": rutaRelativa,
                                "hx-target": "#main-container",
                                "hx-swap": "innerHTML"
                            };
                        }
                        console.log(`[NUEVA RUTA] Añadida: ${clave}`);
                    }
                }
            }
        });

        // Guardar manteniendo lo viejo y lo nuevo
        const jsonResultado = JSON.stringify(mapaRutas, null, 4);

        // Asegurar que la carpeta destino del archivo de salida exista antes de escribir
        const dirDestino = path.dirname(outputFile);
        if (!fs.existsSync(dirDestino)) {
            fs.mkdirSync(dirDestino, { recursive: true });
        }

        fs.writeFileSync(outputFile, jsonResultado, 'utf8');
        console.log(`\n¡Proceso terminado! Archivo "${path.basename(outputFile)}" guardado con éxito.`);

    } catch (error) {
        console.error('Hubo un error al procesar las rutas:', error);
    }
}

generarMapaRutas();