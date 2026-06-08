/**
 * WebSocket Client para Hot Reload
 */
function setupReloadSocket() {
  const socket = new WebSocket('ws://localhost:3000');

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.action === 'reload') {
      console.log("IEEE: Señal de recarga recibida. Programando reinicio en 5s...");
      // Damos 5 segundos para que la página muestre la notificación y se recargue
      setTimeout(() => chrome.runtime.reload(), 5000);
    }
  };

  socket.onclose = () => {
    setTimeout(setupReloadSocket, 5000); // Reintento de conexión
  };
}

setupReloadSocket();

/**
 * Intenta enviar el mensaje al content script. 
 * Si falla porque el script no está presente, lo inyecta manualmente.
 */
async function toggleSidebar(tab) {
  if (!tab?.id || tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { action: "toggle-sidebar" });
  } catch (error) {
    // El error "Could not establish connection" indica que el content script no está cargado
    if (error.message.includes("Could not establish connection")) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["styles.css"]
        });
        // Reintentar envío tras la inyección
        await chrome.tabs.sendMessage(tab.id, { action: "toggle-sidebar" });
      } catch (injectError) {
        console.error("No se pudo inyectar el script IEEE:", injectError);
      }
    } else {
      console.error("Error de comunicación IEEE:", error);
    }
  }
}

chrome.action.onClicked.addListener(toggleSidebar);

chrome.commands.onCommand.addListener((command) => {
  console.log("Evento de comando recibido:", command);
  if (command === "toggle-ieee-sidebar") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) toggleSidebar(tabs[0]);
    });
  }
});

/**
 * Escucha peticiones de ejecución desde el content script.
 * Ejecuta la función en el "Mundo Principal" (MAIN world) para bypass de CSP.
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "execute-script" && sender.tab) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: (fnStr) => {
        try {
          const parts = fnStr.split('.');
          let fn = window;
          for (const part of parts) { fn = fn[part]; }
          if (typeof fn === 'function') fn();
          else console.warn(`IEEE: La función ${fnStr} no existe en window.`);
        } catch (e) {
          console.error("Error ejecutando IEEE Method:", e);
        }
      },
      args: [message.fnString]
    });
  }

  // Flujo completo de Sincronización ejecutado en el Main World
  if (message.action === "sileo-sync-flow" && sender.tab) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: async (prepData) => {
        if (!window.sileo) return;
        window.sileo.show({
          title: "Cambios detectados",
          description: prepData.changes.message,
          state: "info",
          duration: null,
          button: {
            title: "Aplicar y Reiniciar",
            onClick: async () => {
              // 1. Enviar confirmación al servidor
              const res = await fetch('http://localhost:3000/api/sync/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'accept' })
              });

              if (res.ok) {
                // 2. Mostrar aviso de recarga inminente
                window.sileo.warning({
                  title: "Sincronización Lista",
                  description: "La extensión se ha actualizado. Recargando la página en 4 segundos...",
                  duration: 4000
                });

                // 3. Programar recarga automática de la página
                setTimeout(() => window.location.reload(), 4000);
              }
            }
          }
        });
      },
      args: [message.data]
    });
  }

  // Notificación genérica de Sileo desde la extensión
  if (message.action === "sileo-notify" && sender.tab) {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: (type, options) => {
        if (window.sileo && window.sileo[type]) {
          // Si hay un callback de refrescar, lo reconstruimos
          if (options.shouldReload) {
            options.button = { title: "Refrescar ahora", onClick: () => window.location.reload() };
          }
          window.sileo[type](options);
        }
      },
      args: [message.method, message.options]
    });
  }
});