import os
import json
import time
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
import socketserver
import threading
import hashlib
import base64
import struct

# Configuración de Rutas y Puertos
PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MANIFEST_PATH = os.path.join(BASE_DIR, 'manifest.json')
REGISTRY_PATH = os.path.join(BASE_DIR, 'scripts', 'registry.json')
TOOLS_DIR = os.path.join(BASE_DIR, 'scripts')

# Estado de clientes WebSocket conectados
ws_clients = set()
clients_lock = threading.Lock()

def broadcast_reload():
    """Envía una señal de recarga ('reload') a todos los WebSockets conectados."""
    payload = json.dumps({"action": "reload"}).encode('utf-8')
    
    # Construcción manual de un frame de texto WebSocket (Fin=1, Opcode=1)
    length = len(payload)
    if length <= 125:
        header = struct.pack('!BB', 0x81, length)
    elif length <= 65535:
        header = struct.pack('!BBH', 0x81, 126, length)
    else:
        header = struct.pack('!BBR', 0x81, 127, length)
        
    frame = header + payload

    with clients_lock:
        to_remove = set()
        for client_socket in ws_clients:
            try:
                client_socket.sendall(frame)
            except Exception:
                to_remove.add(client_socket)
        ws_clients.difference_update(to_remove)


class CombinedHTTPAndWSHandler(BaseHTTPRequestHandler):
    
    # Manejar CORS simulando la configuración de Express
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        # Interceptar handshake del WebSocket ("Upgrade" de Express)
        if self.headers.get('Upgrade', '').lower() == 'websocket':
            self.handle_websocket_handshake()
            return

        self.send_error(404, "Not Found")

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else ""
        
        # 1. Preparar Sincronización
        if self.path == '/api/sync/prepare':
            try:
                files = os.listdir(TOOLS_DIR)
                found_tools = [f for f in files if f.endswith('.js') and f != 'sileo-bundle.umd.js']
                
                registry_mtime = os.path.getmtime(REGISTRY_PATH) * 1000  # Convertir a milisegundos
                
                with open(REGISTRY_PATH, 'r', encoding='utf-8') as f:
                    current_registry = json.load(f)
                
                new_files = [f for f in found_tools if f not in current_registry]
                modified_files = []
                
                for f in found_tools:
                    if f in current_registry:
                        f_mtime = os.path.getmtime(os.path.join(TOOLS_DIR, f)) * 1000
                        if f_mtime > registry_mtime:
                            modified_files.append(f)
                            
                has_changes = len(new_files) > 0 or len(modified_files) > 0
                message = "No hay archivos nuevos ni modificados, pero se actualizará la versión del manifest."
                
                if has_changes:
                    change_details = []
                    if len(new_files) > 0: 
                        change_details.append(f"{len(new_files)} nuevos")
                    if len(modified_files) > 0: 
                        change_details.append(f"{len(modified_files)} modificados ({', '.join(modified_files)})")
                    message = f"Cambios detectados: {' y '.join(change_details)}."

                response_data = {
                    "success": True,
                    "changes": {
                        "total": len(found_tools),
                        "newFiles": new_files,
                        "modifiedFiles": modified_files,
                        "message": message
                    }
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        # 2. Confirmar Sincronización
        elif self.path == '/api/sync/commit':
            try:
                req_data = json.loads(body) if body else {}
                action = req_data.get('action')
                
                if action == 'accept':
                    # Incrementar versión del manifest
                    with open(MANIFEST_PATH, 'r+', encoding='utf-8') as f:
                        manifest = json.load(f)
                        version_parts = manifest['version'].split('.')
                        version_parts[-1] = str(int(version_parts[-1]) + 1)
                        manifest['version'] = '.'.join(version_parts)
                        
                        f.seek(0)
                        json.dump(manifest, f, indent=2)
                        f.truncate()
                        
                    new_version = manifest['version']
                    
                    # Actualizar registry
                    files = os.listdir(TOOLS_DIR)
                    tools = [f for f in files if f.endswith('.js') and f != 'sileo-bundle.umd.js']
                    with open(REGISTRY_PATH, 'w', encoding='utf-8') as f:
                        json.dump(["sileo-bundle.umd.js"] + tools, f, indent=2)
                        
                    print(f"[IEEE Server] Versión actualizada a {new_version}. Notificando recarga...")
                    broadcast_reload()
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "newVersion": new_version}).encode('utf-8'))
                else:
                    print("[IEEE Server] Sincronización rechazada por el usuario.")
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": True, "message": "Cambios descartados."}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_error(404, "Not Found")

    def handle_websocket_handshake(self):
        """Gestiona el protocolo de apertura de WebSocket de forma nativa."""
        key = self.headers.get('Sec-WebSocket-Key')
        if not key:
            self.send_error(400, "Missing Sec-WebSocket-Key")
            return
        
        # Generar el hash mágico de aceptación requerido por el protocolo WebSocket
        GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        accept_sha1 = hashlib.sha1((key + GUID).encode('utf-8')).digest()
        accept_b64 = base64.b64encode(accept_sha1).decode('utf-8')
        
        # Responder con el código HTTP 101 Switching Protocols
        self.wfile.write(b"HTTP/1.1 101 Switching Protocols\r\n")
        self.wfile.write(b"Upgrade: websocket\r\n")
        self.wfile.write(b"Connection: Upgrade\r\n")
        self.wfile.write(f"Sec-WebSocket-Accept: {accept_b64}\r\n\r\n".encode('utf-8'))
        
        # Desacoplar el socket para mantener la conexión viva de fondo
        self.wfile.flush()
        detached_socket = self.request
        
        with clients_lock:
            ws_clients.add(detached_socket)
            
        # Mantenemos un hilo escuchando para saber cuándo se desconecta el cliente
        def liveness_checker():
            while True:
                try:
                    # Intenta leer datos basura del cliente para validar si se cerró la conexión
                    data = detached_socket.recv(1024)
                    if not data: break 
                except Exception:
                    break
            with clients_lock:
                ws_clients.discard(detached_socket)

        t = threading.Thread(target=liveness_checker, daemon=True)
        t.start()
        
        # Evitamos que la clase HTTP base cierre este socket al terminar la función
        self.close_connection = False


class ThreadedHTTPServer(socketserver.ThreadingMixIn, HTTPServer):
    """Permite manejar múltiples peticiones concurrentes (hilos)"""
    daemon_threads = True

if __name__ == '__main__':
    server = ThreadedHTTPServer(('localhost', PORT), CombinedHTTPAndWSHandler)
    print(f"🚀 IEEE Dev Server corriendo en http://localhost:{PORT} (Python puro)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[IEEE Server] Apagando servidor.")
        server.server_close()