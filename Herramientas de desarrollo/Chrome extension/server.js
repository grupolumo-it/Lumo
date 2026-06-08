// Ejecuta node server.js para iniciar el servidor de desarrollo. Este servidor se encargará de gestionar la sincronización de herramientas, actualizar el manifest.json y notificar a las extensiones para recargar cuando haya cambios. Asegúrate de tener Node.js instalado y de ejecutar este comando desde la raíz del proyecto donde se encuentra el server.js.

// c:\Users\LordLoro05\Lumo\Website\Herramientas de desarrollo\server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const REGISTRY_PATH = path.join(__dirname, 'scripts', 'registry.json');
const TOOLS_DIR = path.join(__dirname, 'scripts'); // Usamos scripts como base de herramientas

// Servidor WebSocket
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});

function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === 1) client.send(JSON.stringify(message));
    });
}

// 1. Preparar Sincronización: Solo lee y compara
app.post('/api/sync/prepare', (req, res) => {
    try {
        const files = fs.readdirSync(TOOLS_DIR);
        const foundTools = files.filter(f => f.endsWith('.js') && f !== 'sileo-bundle.umd.js');
        
        const registryStats = fs.statSync(REGISTRY_PATH);
        const lastSyncTime = registryStats.mtimeMs;

        const currentRegistry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        
        // Identificar archivos nuevos (no están en el registro)
        const newFiles = foundTools.filter(f => !currentRegistry.includes(f));

        // Identificar archivos modificados (están en el registro pero su fecha es posterior a la última sincronización)
        const modifiedFiles = foundTools.filter(f => {
            if (!currentRegistry.includes(f)) return false;
            const stats = fs.statSync(path.join(TOOLS_DIR, f));
            return stats.mtimeMs > lastSyncTime;
        });

        const hasChanges = newFiles.length > 0 || modifiedFiles.length > 0;
        let message = "No hay archivos nuevos ni modificados, pero se actualizará la versión del manifest.";
        
        if (hasChanges) {
            const changeDetails = [];
            if (newFiles.length > 0) changeDetails.push(`${newFiles.length} nuevos`);
            if (modifiedFiles.length > 0) changeDetails.push(`${modifiedFiles.length} modificados (${modifiedFiles.join(', ')})`);
            message = `Cambios detectados: ${changeDetails.join(' y ')}.`;
        }

        res.json({ 
            success: true, 
            changes: {
                total: foundTools.length,
                newFiles: newFiles,
                modifiedFiles: modifiedFiles,
                message: message
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Confirmar Sincronización: Escribe en disco y reinicia
app.post('/api/sync/commit', (req, res) => {
    const { action } = req.body;

    if (action === 'accept') {
        // 2. Incrementar versión en manifest.json
        const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
        const versionParts = manifest.version.split('.');
        versionParts[versionParts.length - 1] = parseInt(versionParts[versionParts.length - 1]) + 1;
        manifest.version = versionParts.join('.');
        
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

        // Actualizar registry
        const files = fs.readdirSync(TOOLS_DIR);
        const tools = files.filter(f => f.endsWith('.js') && f !== 'sileo-bundle.umd.js');
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(["sileo-bundle.umd.js", ...tools], null, 2));

        console.log(`[IEEE Server] Versión actualizada a ${manifest.version}. Notificando recarga...`);
        broadcast({ action: 'reload' });
        res.json({ success: true, newVersion: manifest.version });
    } else {
        console.log("[IEEE Server] Sincronización rechazada por el usuario.");
        res.json({ success: true, message: "Cambios descartados." });
    }
});

const server = app.listen(PORT, () => {
    console.log(`🚀 IEEE Dev Server corriendo en http://localhost:${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
