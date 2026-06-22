/**
 * @file Opciones de Ejecución del Generador de Rutas
 * @description Este script escanea una carpeta de páginas, detecta subcarpetas con archivos 'index.html'
 * y genera o actualiza un archivo JSON de mapeo de rutas compatible con el enrutador HTMX.
 * Mantiene intactas las modificaciones manuales previas en el JSON.
 *
 * @usage
 * Puedes ejecutar este script desde la terminal de tres maneras:
 * * 1. Uso por Defecto (Entrada: 'Pages', Salida: 'rutas.json'):
 * $ node nombre-del-script.js
 * * 2. Rutas Relativas Personalizadas:
 * $ node nombre-del-script.js src/paginas public/config/rutas.json
 * * 3. Rutas Absolutas (Soporta arrastrar carpetas a la terminal):
 * $ node nombre-del-script.js /Users/proyecto/vistas /Users/proyecto/dist/rutas.json
 *
 * @param {string} [process.argv[2]='Pages'] - Carpeta origen que contiene las subcarpetas de las páginas.
 * @param {string} [process.argv[3]='rutas.json'] - Ruta y nombre del archivo JSON que se creará o actualizará.
 */

const fs = require('fs');
const path = require('path');

// 1. Capturar argumentos desde la terminal (o usar valores por defecto)
// Uso: node script.js [carpetaOrigen] [archivoSalida]
const carpetaEntradaInput = process.argv[2] || 'Pages';
const archivoSalidaInput = process.argv[3] || 'rutas.json';

// 2. Convertir a rutas absolutas seguras
const pagesDir = path.isAbsolute(carpetaEntradaInput) ? carpetaEntradaInput : path.join(__dirname, carpetaEntradaInput);
const outputFile = path.isAbsolute(archivoSalidaInput) ? archivoSalidaInput : path.join(__dirname, archivoSalidaInput);

// Obtenemos el nombre base de la carpeta padre (ej: 'Pages' o 'src/vistas' -> 'vistas')
const nombreCarpetaPadre = path.basename(pagesDir);

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
                    const rutaHtmx = `/${carpeta}`;

                    // SOLO agregamos el objeto si NO existe ya en el archivo
                    if (!mapaRutas[clave]) {
                        mapaRutas[clave] = {
                            archivo: rutaRelativa,
                            "hx-get": rutaRelativa,
                            "hx-trigger": "load",
                            "hx-target": "this",
                            "hx-swap": "outerHTML",
                            "hx-push-url": rutaHtmx
                        };
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