/**
 * Script IEEE Interno: Lumo LocalStorage Editor
 * Permite la gestión visual y textual de llaves JSON en el almacenamiento local.
 */
(function() {
    const CONFIG = {
        id: "ieee_storage_editor",
        nombre: "Editor LocalStorage",
        descripcion: "Gestor gráfico de JSON para LocalStorage",
        icono: "fa-solid fa-database",
        metodos: [
            { 
                nombre: "Abrir Editor de Almacenamiento", 
                icono: "fa-solid fa-pen-to-square",
                funcionGlobal: "lumoStorageEditor", 
                descripcion: "Inicia el panel de edición de localStorage" 
            }
        ]
    };

    localStorage.setItem(CONFIG.id, JSON.stringify(CONFIG));

    window.lumoStorageEditor = function() {
        if (document.getElementById('lumo-storage-overlay')) return;

        // Inyección de Estilos (Diseño Lumo: Midnight Blue & Soft Geometry)
        const style = document.createElement('style');
        style.id = 'lumo-storage-editor-styles';
        style.innerHTML = `
            #lumo-storage-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 13, 71, 0.5); backdrop-filter: blur(8px);
                z-index: 100000; display: flex; align-items: center; justify-content: center;
                font-family: 'Comfortaa', sans-serif; animation: lse-fade-in 0.3s ease;
            }
            @keyframes lse-fade-in { from { opacity: 0; } to { opacity: 1; } }
            
            #lumo-storage-modal {
                background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px);
                width: 90%; max-width: 950px; height: 80vh;
                border-radius: 1.5rem; display: flex; flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;
                border: 1px solid #efeded;
            }
            .lse-header {
                padding: 1.5rem 2rem; background: transparent; color: #000d46;
                display: flex; justify-content: space-between; align-items: center;
                font-weight: 600; border-bottom: 1px solid #efeded;
            }
            .lse-header i { margin-right: 0.5rem; }
            .lse-body { display: flex; flex: 1; overflow: hidden; background: transparent; }
            .lse-sidebar {
                width: 280px; border-right: 1px solid #efeded; background: rgba(255, 255, 255, 0.4);
                display: flex; flex-direction: column;
            }
            .lse-search-container {
                padding: 1rem 1.5rem; border-bottom: 1px solid #efeded;
                display: flex; align-items: center; gap: 0.5rem;
            }
            .lse-search-container input {
                flex: 1; padding: 0.75rem 1.25rem; border-radius: 1rem;
                border: 1px solid transparent; background: #f5f3f3; 
                font-family: inherit; font-size: 13px; color: #000d46;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .lse-search-container input::placeholder { color: #9ca3af; }
            .lse-search-container input:focus { outline: none; background: #fff; border-color: #000d46; box-shadow: 0 4px 20px rgba(0, 13, 70, 0.1); }
            .lse-keys-list { flex: 1; overflow-y: auto; }
            .lse-key-item {
                padding: 1rem 1.5rem; cursor: pointer; transition: all 0.2s;
                border-bottom: 1px solid #f5f3f3; font-size: 13px; color: #454652;
                display: flex; align-items: center; justify-content: space-between;
            }
            .lse-key-item:hover { background: #efeded; color: #000d46; }
            .lse-key-item.active { background: #dde1ff; color: #000d46; font-weight: bold; border-right: 4px solid #000d46; }
            
            .lse-key-actions { display: flex; gap: 0.4rem; opacity: 0; transition: 0.2s; }
            .lse-key-item:hover .lse-key-actions { opacity: 1; }
            
            .lse-content { flex: 1; display: flex; flex-direction: column; background: transparent; }
            .lse-tabs {
                display: flex; background: #efeded; padding: 0.75rem 1rem 0; gap: 0.25rem;
            }
            .lse-tab {
                padding: 0.6rem 1.2rem; border-radius: 0.75rem 0.75rem 0 0;
                cursor: pointer; background: #dbdad9; font-size: 12px; color: #454652;
                transition: 0.2s;
            }
            .lse-tab.active { background: #ffffff; color: #000d46; font-weight: bold; }
            
            .lse-viewer { flex: 1; overflow: auto; padding: 1.5rem; }
            .lse-tree-node { margin-left: 1.2rem; border-left: 1px solid #dbdad9; padding-left: 0.8rem; }
            .lse-node-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 13px; }
            .lse-key { color: #575c80; font-weight: 600; }
            .lse-input { 
                border: 1px solid #c5c5d3; border-radius: 0.5rem; padding: 4px 8px; 
                font-family: 'SFMono-Regular', monospace; font-size: 12px; flex: 1;
            }
            .lse-btn-icon { cursor: pointer; color: #757683; border: none; background: none; transition: 0.2s; }
            .lse-btn-icon:hover { color: #ba1a1a; transform: scale(1.1); }
            
            #lse-raw-editor {
                width: 100%; height: 100%; border: none; resize: none;
                font-family: 'SFMono-Regular', Consolas, monospace; font-size: 13px;
                padding: 1rem; outline: none; background: #faf9f9; border-radius: 0.5rem;
            }
            .lse-footer {
                padding: 1.25rem 2rem; border-top: 1px solid #efeded; background: transparent;
                display: flex; justify-content: flex-end; gap: 1rem;
            }
            .lse-btn {
                padding: 0.6rem 1.8rem; border-radius: 9999px; border: none;
                cursor: pointer; font-family: inherit; font-weight: 600; font-size: 14px;
            }
            .lse-btn-primary { background: #000d46; color: white; }
            .lse-btn-secondary { background: #dbdad9; color: #1b1c1c; }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'lumo-storage-overlay';
        overlay.innerHTML = `
            <div id="lumo-storage-modal">
                <div class="lse-header">
                    <span><i class="fa-solid fa-database"></i> Editor LocalStorage</span>
                    <button class="lse-btn-icon" id="lse-close-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="lse-body">
                    <div class="lse-sidebar">
                        <div class="lse-search-container">
                            <input type="text" id="lse-search-input" placeholder="Filtrar...">
                            <button class="lse-btn-icon" id="lse-add-key-btn" title="Nueva llave"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <div class="lse-keys-list" id="lse-keys-container"></div>
                    </div>
                    <div class="lse-content">
                        <div class="lse-tabs">
                            <div class="lse-tab active" data-tab="graph">Estructura Gráfica</div>
                            <div class="lse-tab" data-tab="text">JSON Crudo</div>
                        </div>
                        <div class="lse-viewer" id="lse-graph-view"></div>
                        <div class="lse-viewer" id="lse-text-view" style="display:none"><textarea id="lse-raw-editor" spellcheck="false"></textarea></div>
                    </div>
                </div>
                <div class="lse-footer">
                    <button class="lse-btn lse-btn-secondary" id="lse-cancel-btn">Cancelar</button>
                    <button class="lse-btn lse-btn-primary" id="lse-save-btn">Guardar en Storage</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        let state = { currentKey: null, data: null, view: 'graph' };

        const refreshKeys = (filter = '') => {
            const container = document.getElementById('lse-keys-container');
            container.innerHTML = '';
            Object.keys(localStorage)
                .filter(k => k.toLowerCase().includes(filter.toLowerCase()))
                .sort().forEach(key => {
                    const div = document.createElement('div');
                    div.className = `lse-key-item ${key === state.currentKey ? 'active' : ''}`;
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.innerText = key;
                    nameSpan.style.flex = "1";
                    nameSpan.style.overflow = "hidden";
                    nameSpan.style.textOverflow = "ellipsis";

                    const actions = document.createElement('div');
                    actions.className = 'lse-key-actions';

                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'lse-btn-icon';
                    copyBtn.title = 'Duplicar llave';
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
                    copyBtn.onclick = (e) => { e.stopPropagation(); copyKey(key); };

                    const delBtn = document.createElement('button');
                    delBtn.className = 'lse-btn-icon';
                    delBtn.title = 'Eliminar llave';
                    delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    delBtn.onclick = (e) => { e.stopPropagation(); deleteKey(key); };

                    actions.appendChild(copyBtn);
                    actions.appendChild(delBtn);
                    
                    div.appendChild(nameSpan);
                    div.appendChild(actions);
                    div.onclick = () => selectKey(key);
                    container.appendChild(div);
                });
        };

        const selectKey = (key) => {
            state.currentKey = key;
            const raw = localStorage.getItem(key);
            try { state.data = JSON.parse(raw); } catch (e) { state.data = raw; }
            refreshKeys(document.getElementById('lse-search-input').value);
            renderCurrentView();
        };

        const renderCurrentView = () => {
            const graph = document.getElementById('lse-graph-view');
            const text = document.getElementById('lse-text-view');
            const editor = document.getElementById('lse-raw-editor');

            if (state.view === 'graph') {
                graph.style.display = 'block'; text.style.display = 'none';
                graph.innerHTML = '';
                if (!state.currentKey) graph.innerHTML = '<p style="text-align:center; color:#757683; margin-top:4rem;">Seleccione una llave del panel izquierdo</p>';
                else graph.appendChild(createNode('', state.data, (val) => state.data = val));
            } else {
                graph.style.display = 'none'; text.style.display = 'block';
                editor.value = typeof state.data === 'object' ? JSON.stringify(state.data, null, 4) : state.data;
            }
        };

        const createNode = (key, value, updateFn) => {
            const div = document.createElement('div');
            div.className = 'lse-tree-node';
            const row = document.createElement('div');
            row.className = 'lse-node-row';
            
            if (typeof value === 'object' && value !== null) {
                const isArr = Array.isArray(value);
                row.innerHTML = `<span class="lse-key">${key ? key + ':' : ''}</span> <i>${isArr ? 'Array' : 'Object'}</i> 
                                 <button class="lse-btn-icon add-btn"><i class="fa-solid fa-plus"></i></button>`;
                row.querySelector('.add-btn').onclick = () => {
                    const newK = isArr ? value.length : prompt("Nombre de propiedad:");
                    if (newK !== null) { value[newK] = ""; updateFn(value); renderCurrentView(); }
                };
                div.appendChild(row);
                Object.entries(value).forEach(([k, v]) => {
                    div.appendChild(createNode(k, v, (newV) => {
                        if (newV === undefined) { if(isArr) value.splice(k, 1); else delete value[k]; }
                        else value[k] = newV;
                        updateFn(value);
                    }));
                });
            } else {
                row.innerHTML = `<span class="lse-key">${key}:</span> 
                                 <input class="lse-input" value="${value}">
                                 <button class="lse-btn-icon del-btn"><i class="fa-solid fa-trash"></i></button>`;
                const input = row.querySelector('input');
                input.onchange = () => { 
                    let v = input.value; 
                    if (v === 'true') v = true; else if (v === 'false') v = false; else if (!isNaN(v) && v.trim() !== '') v = Number(v);
                    updateFn(v); 
                };
                row.querySelector('.del-btn').onclick = () => { updateFn(undefined); renderCurrentView(); };
                div.appendChild(row);
            }
            return div;
        };

        const copyKey = (key) => {
            const val = localStorage.getItem(key);
            let newKey = `${key}_copy`;
            let counter = 1;

            // Asegurar un nombre único para la copia
            while (localStorage.getItem(newKey)) {
                newKey = `${key}_copy_${counter++}`;
            }

            localStorage.setItem(newKey, val);
            selectKey(newKey); // Esto actualiza el estado y refresca la vista
            if (window.sileo) window.sileo.success({ title: "Llave Duplicada", description: `Se creó y abrió '${newKey}'.` });
        };

        const deleteKey = (key) => {
            if (confirm(`¿Eliminar la llave '${key}' permanentemente?`)) {
                localStorage.removeItem(key);
                if (state.currentKey === key) {
                    state.currentKey = null;
                    state.data = null;
                }
                if (window.sileo) window.sileo.warning({ title: "Eliminado", description: `Se borró la llave '${key}'.` });
                refreshKeys(document.getElementById('lse-search-input').value);
                renderCurrentView();
            }
        };

        document.getElementById('lse-add-key-btn').onclick = () => {
            const key = prompt("Nombre de la nueva llave:");
            if (key && key.trim()) {
                if (localStorage.getItem(key)) {
                    if (window.sileo) window.sileo.error({ title: "Error", description: "La llave ya existe." });
                    return;
                }
                localStorage.setItem(key, "");
                selectKey(key);
                if (window.sileo) window.sileo.success({ title: "Creado", description: `Nueva llave '${key}' añadida.` });
            }
        };

        document.getElementById('lse-search-input').oninput = (e) => refreshKeys(e.target.value);
        document.querySelectorAll('.lse-tab').forEach(tab => tab.onclick = () => {
            if (state.view === 'text') try { state.data = JSON.parse(document.getElementById('lse-raw-editor').value); } catch(e) {}
            document.querySelectorAll('.lse-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.view = tab.dataset.tab;
            renderCurrentView();
        });

        const close = () => { overlay.remove(); style.remove(); };
        document.getElementById('lse-close-btn').onclick = close;
        document.getElementById('lse-cancel-btn').onclick = close;
        document.getElementById('lse-save-btn').onclick = () => {
            if (!state.currentKey) return;
            if (state.view === 'text') try { state.data = JSON.parse(document.getElementById('lse-raw-editor').value); } catch(e) { state.data = document.getElementById('lse-raw-editor').value; }
            localStorage.setItem(state.currentKey, typeof state.data === 'object' ? JSON.stringify(state.data) : state.data);
            if (window.sileo) window.sileo.success({ title: "Storage Actualizado", description: `Llave '${state.currentKey}' guardada.` });
            close();
        };

        refreshKeys();
        console.log("%c[Lumo Storage Editor] Iniciado 💾", "color: #000d46; font-weight: bold;");
    };

    console.log(`%c[IEEE] ${CONFIG.nombre} registrado y listo`, "color: #575c80; font-weight: bold;");
})();