const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'Pages');
const outputFile = path.join(__dirname, 'rutas.json');

function generarMapaRutas() {
    let mapaRutas = {};

    try {
        // 1. Si el archivo ya existe, leer su contenido actual para NO borrarlo
        if (fs.existsSync(outputFile)) {
            const contenidoActual = fs.readFileSync(outputFile, 'utf8');
            if (contenidoActual.trim()) {
                mapaRutas = JSON.parse(contenidoActual);
            }
        }

        if (!fs.existsSync(pagesDir)) {
            console.error(`La carpeta ${pagesDir} no existe.`);
            return;
        }

        // 2. Leer las carpetas de 'Pages'
        const carpetas = fs.readdirSync(pagesDir);

        carpetas.forEach(carpeta => {
            const rutaCarpeta = path.join(pagesDir, carpeta);

            if (fs.statSync(rutaCarpeta).isDirectory()) {
                const archivoHtml = path.join(rutaCarpeta, 'index.html');

                if (fs.existsSync(archivoHtml)) {
                    const clave = `#${carpeta}`;
                    const rutaRelativa = `Pages/${carpeta}/index.html`;
                    const rutaHtmx = `/${carpeta}`;

                    // 3. SOLO agregamos el objeto si NO existe ya en el archivo
                    // Esto protege tus ediciones manuales para que el script no las pise
                    if (!mapaRutas[clave]) {
                        mapaRutas[clave] = {
                            archivo: rutaRelativa,
                            "hx-get": rutaRelativa,
                            "hx-trigger": "load",
                            "hx-target": "this",
                            "hx-swap": "outerHTML",
                            "hx-push-url": rutaHtmx
                        };
                        console.log(`Añadida nueva ruta: ${clave}`);
                    }
                }
            }
        });

        // 4. Guardar manteniendo lo viejo y lo nuevo
        const jsonResultado = JSON.stringify(mapaRutas, null, 4);
        fs.writeFileSync(outputFile, jsonResultado, 'utf8');

        console.log('¡Archivo rutas.json actualizado correctamente!');

    } catch (error) {
        console.error('Hubo un error al procesar las rutas:', error);
    }
}

generarMapaRutas();