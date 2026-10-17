// ==========================================
// MÓDULO TÁTICO & QUADRO DE TREINO E VÍDEOS
// ==========================================

window.stratTab = window.stratTab || 'quadro';
window.videoForm = null;

function taticaTabsHTML() {
    return `
    <div class="seg" style="margin:10px 16px;">
        <div class="seg-btn ${window.stratTab==='quadro'?'active':''}" onclick="window.stratTab='quadro'; render();">🎯 Quadro</div>
        <div class="seg-btn ${window.stratTab==='caderno'?'active':''}" onclick="window.stratTab='caderno'; render();">📓 Caderno</div>
        <div class="seg-btn ${window.stratTab==='videos'?'active':''}" onclick="window.stratTab='videos'; render();">🎥 Vídeos</div>
    </div>`;
}

// DESENHO DO CAMPO (FUTSAL E FUTEBOL)
window.getPitchSVG = function(isHalf) {
    const mode = state.gameMode || 'futebol';
    
    if (mode === 'futsal') {
        if (isHalf) {
            return `
                <rect x="0" y="0" width="100" height="75" fill="#113821" />
                <rect x="3" y="3" width="94" height="69" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" rx="2" />
                <line x1="3" y1="72" x2="97" y2="72" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <circle cx="50" cy="72" r="14" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <path d="M 30 3 A 20 20 0 0 0 70 3" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
            `;
        } else {
            return `
                <rect x="0" y="0" width="100" height="75" fill="#113821" />
                <rect x="3" y="3" width="94" height="69" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" rx="2" />
                <line x1="50" y1="3" x2="50" y2="72" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <circle cx="50" cy="37.5" r="10" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <path d="M 3 22 A 15.5 15.5 0 0 1 3 53" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <path d="M 97 22 A 15.5 15.5 0 0 0 97 53" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
            `;
        }
    } else {
        if (isHalf) {
            return `
                <rect x="0" y="0" width="100" height="75" fill="#113821" />
                <rect x="3" y="3" width="94" height="69" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <line x1="3" y1="72" x2="97" y2="72" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <circle cx="50" cy="72" r="14" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <rect x="22" y="3" width="56" height="18" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <rect x="34" y="3" width="32" height="7" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
            `;
        } else {
            return `
                <rect x="0" y="0" width="100" height="75" fill="#113821" />
                <rect x="3" y="3" width="94" height="69" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <line x1="50" y1="3" x2="50" y2="72" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <circle cx="50" cy="37.5" r="10" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <rect x="3" y="20" width="14" height="35" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
                <rect x="83" y="20" width="14" height="35" fill="none" stroke="#FFFFFF" stroke-width="0.8" stroke-opacity="0.6" />
            `;
        }
    }
};

window.removeTacticPieceByPlayerId = function(playerId) {
    if (!state.tactics) return;
    state.tactics = state.tactics.filter(i => i.playerId !== playerId);
    saveState();
    render();
};

window.undoLastTacticPiece = function() {
    if (!state.tactics || state.tactics.length === 0) return;
    state.tactics.pop();
    saveState();
    render();
};

window.spawnTacticItem = function(kind) {
    if(!state.tactics) state.tactics = [];
    let item = { id: uid(), kind: kind, x: 50, y: 50 };
    if (kind === 'own' || kind === 'opp') item.label = ''; 
    state.tactics.push(item);
    saveState();
    render();
};

window.getTacticItemSVG = function(item) {
    if (item.kind === 'ball') {
        return `
            <circle cx="0" cy="0" r="8" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
            <path d="M 0 -3.5 L 3 -1.5 L 2 2.5 L -2 2.5 L -3 -1.5 Z" fill="#000000" />
            <path d="M 0 -3.5 L 0 -8 M 3 -1.5 L 7.5 -2.5 M 2 2.5 L 4.5 7 M -2 2.5 L -4.5 7 M -3 -1.5 L -7.5 -2.5" stroke="#000000" stroke-width="1.2"/>
        `;
    }
    if (item.kind === 'cone') {
        return `<g>
            <polygon points="-3,4 3,4 1.5,-4 -1.5,-4" fill="#FF9500" stroke="#000" stroke-width="0.5"/>
            <ellipse cx="0" cy="4" rx="4" ry="1.5" fill="#FF9500" stroke="#000" stroke-width="0.5"/>
        </g>`;
    } 
    if (item.kind === 'minigoal') {
        return `<g>
            <rect x="-5" y="-3" width="10" height="6" rx="1" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
            <line x1="-5" y1="-3" x2="5" y2="-3" stroke="#FF3B30" stroke-width="1"/>
        </g>`;
    }
    if (item.kind === 'pole') {
        return `<g>
            <circle cx="0" cy="0" r="2" fill="#FF2D55" stroke="#000" stroke-width="0.5"/>
            <line x1="0" y1="0" x2="0" y2="-6" stroke="#FF2D55" stroke-width="1.5"/>
        </g>`;
    }
    if (item.kind === 'rope') {
        return `<g>
            <line x1="-8" y1="-3" x2="8" y2="-3" stroke="#EAB308" stroke-width="0.8"/>
            <line x1="-8" y1="3" x2="8" y2="3" stroke="#EAB308" stroke-width="0.8"/>
            <line x1="-6" y1="-3" x2="-6" y2="3" stroke="#EAB308" stroke-width="0.8"/>
            <line x1="-2" y1="-3" x2="-2" y2="3" stroke="#EAB308" stroke-width="0.8"/>
            <line x1="2" y1="-3" x2="2" y2="3" stroke="#EAB308" stroke-width="0.8"/>
            <line x1="6" y1="-3" x2="6" y2="3" stroke="#EAB308" stroke-width="0.8"/>
        </g>`;
    }
    if (item.kind === 'ring') {
        return `<circle cx="0" cy="0" r="6" fill="none" stroke="#FF2D55" stroke-width="1.5"/>`;
    }
    return '';
};

window.removeTacticPiece = function(id) { 
    if(!state.tactics) return; 
    state.tactics = state.tactics.filter(i => i.id !== id); 
    saveState(); 
    render(); 
};

let currentTacticMode = 'move'; 
let currentDrawColor = '#E1C324'; 
let isDrawing = false; 
let tacticCtx = null; 

window.setTacticMode = function(mode) { currentTacticMode = mode; render(); };
window.setDrawColor = function(color) { currentDrawColor = color; render(); };

window.clearCanvasLines = function() { 
    if (confirm('Tem a certeza que deseja apagar todos os riscos desenhados?')) {
        state.tacticPaths = []; 
        saveState(); 
        redrawCanvas();
        render();
        if(typeof showToast === 'function') showToast('Riscos apagados! 🧹');
    }
};

window.clearAllTacticPieces = function() {
    if (confirm('Tem a certeza que deseja remover todas as peças do relvado?')) {
        state.tactics = [];
        saveState();
        render();
        if(typeof showToast === 'function') showToast('Peças removidas! 🗑️');
    }
};

window.undoLastPath = function() { 
    if (!state.tacticPaths || state.tacticPaths.length === 0) return; 
    state.tacticPaths.pop(); 
    saveState(); 
    render(); 
};

window.togglePitchView = function() {
    const isCurrentlyHalf = !!state.tacticHalfPitch;
    const mapFullToHalf = (x, y) => ({ x: 3 + ((y - 3) / 69) * 94, y: 3 + ((x - 3) / 47) * 69 });
    const mapHalfToFull = (x, y) => ({ x: 3 + ((y - 3) / 69) * 47, y: 3 + ((x - 3) / 94) * 69 });
    
    const transform = (pt) => {
        let x = Number(pt.x) || 0, y = Number(pt.y) || 0;
        let mapped = isCurrentlyHalf ? mapHalfToFull(x, y) : mapFullToHalf(x, y);
        pt.x = Math.round(mapped.x * 100) / 100;
        pt.y = Math.round(mapped.y * 100) / 100;
    };

    if (state.tactics) state.tactics.forEach(transform);
    if (state.tacticPaths) state.tacticPaths.forEach(path => { if(path.points) path.points.forEach(transform); });
    
    state.tacticHalfPitch = !isCurrentlyHalf;
    saveState();
    render();
};

window.renderTatica = function() {
    if (window.stratTab === 'caderno') return window.renderCaderno();
    if (window.stratTab === 'videos') return window.renderVideos();

    if (!state.tactics) state.tactics = [];
    const isHalf = !!state.tacticHalfPitch;
    
    const teamColor = state.teamColor || '#D9A441';
    const oppColor = state.oppColor || '#C8493F';
    const coneColor = '#FF9500'; 
    const getConstrast = typeof getContrastColor === 'function' ? getContrastColor : () => '#000';

    const bW = currentDrawColor === '#FFFFFF' ? 'var(--gold)' : 'transparent';
    const bY = currentDrawColor === '#E1C324' ? 'var(--chalk)' : 'transparent';
    const bR = currentDrawColor === '#E74C3C' ? 'var(--chalk)' : 'transparent';
    const bB = currentDrawColor === '#3498DB' ? 'var(--chalk)' : 'transparent';

    let html = `
    <div> 
    <div class="topbar">
        <h1 style="font-size:18px;">TÁTICA & VÍDEOS</h1>
    </div>
    ${taticaTabsHTML()}
    
    <!-- CONTROLOS SUPERIORES -->
    <div style="display:flex; gap:6px; margin:10px 16px;">
        <button class="btn btn-green" style="flex:1; font-size:10px; padding:8px;" onclick="saveTacticalPlay()">🏋️ GUARDAR EXERCÍCIO</button>
        <button class="btn btn-outline" style="flex:1; font-size:10px; padding:8px; border-color:var(--gold); color:var(--gold);" onclick="exportTacticPDF()">📄 PDF</button>
    </div>
    
    <button class="btn btn-outline" style="width:calc(100% - 32px); margin:0 16px 10px; font-size:11px; padding:8px;" onclick="togglePitchView()">
        ${isHalf ? '⚽ Alternar para CAMPO INTEIRO' : '🏟️ Alternar para MEIO CAMPO'}
    </button>

    <!-- MODOS DE INTERAÇÃO -->
    <div class="seg" style="margin:0 16px 10px;">
        <div class="seg-btn ${currentTacticMode==='move'?'active':''}" onclick="setTacticMode('move')">🖐️ MOVER</div>
        <div class="seg-btn ${currentTacticMode==='draw'?'active':''}" onclick="setTacticMode('draw')">✏️ DESENHAR</div>
    </div>

    ${currentTacticMode === 'draw' ? `
    <div style="display:flex; gap:12px; justify-content:center; align-items:center; margin:0 16px 10px; padding:8px; background:var(--surface-2); border-radius:8px;">
        <div style="width:28px; height:28px; border-radius:50%; background:#FFFFFF; border:2px solid ${bW}; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="setDrawColor('#FFFFFF')">
            ${currentDrawColor === '#FFFFFF' ? '<span style="color:#000; font-size:14px; font-weight:bold;">✓</span>' : ''}
        </div>
        <div style="width:28px; height:28px; border-radius:50%; background:#E1C324; border:2px solid ${bY}; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="setDrawColor('#E1C324')">
            ${currentDrawColor === '#E1C324' ? '<span style="color:#000; font-size:14px; font-weight:bold;">✓</span>' : ''}
        </div>
        <div style="width:28px; height:28px; border-radius:50%; background:#E74C3C; border:2px solid ${bR}; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="setDrawColor('#E74C3C')">
            ${currentDrawColor === '#E74C3C' ? '<span style="color:#000; font-size:14px; font-weight:bold;">✓</span>' : ''}
        </div>
        <div style="width:28px; height:28px; border-radius:50%; background:#3498DB; border:2px solid ${bB}; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="setDrawColor('#3498DB')">
            ${currentDrawColor === '#3498DB' ? '<span style="color:#000; font-size:14px; font-weight:bold;">✓</span>' : ''}
        </div>
    </div>` : ''}

    <!-- CAMPO TÁTICO -->
    <div id="tactic-pitch" style="position:relative; width:calc(100% - 32px); max-width:420px; margin:0 auto 14px; aspect-ratio:4/3; background:#113821; border:2px solid #FFF; border-radius:12px; overflow:hidden; touch-action:none;">
        
        <svg viewBox="0 0 100 75" style="width:100%; height:100%; display:block; position:absolute; top:0; left:0; pointer-events:none;">
            ${typeof getPitchSVG === 'function' ? getPitchSVG(isHalf) : ''}
        </svg>

        <!-- PEÇAS TÁTICAS -->
        ${(state.tactics || []).map(p => {
            let bg = p.kind === 'own' ? teamColor : (p.kind === 'opp' ? oppColor : coneColor);
            let color = p.kind === 'own' ? getConstrast(teamColor) : getConstrast(oppColor);
            let label = p.label || ''; 
            
            if (['cone', 'minigoal', 'pole', 'rope', 'ball', 'ring'].includes(p.kind)) {
                let svgContent = typeof getTacticItemSVG === 'function' ? getTacticItemSVG(p) : '';
                return `<div class="tactic-piece" data-id="${p.id}" ondblclick="removeTacticPiece('${p.id}')" 
                    style="left:${p.x}\%; top:${p.y}%; width:24px; height:24px; position:absolute; transform:translate(-50%, -50%); 
                    display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10;">
                    <svg viewBox="-10 -10 20 20" style="width:100%; height:100%; pointer-events:none; overflow:visible;">${svgContent}</svg>
                </div>`;
            }
            return `<div class="tactic-piece" data-id="${p.id}" ondblclick="removeTacticPiece('${p.id}')" 
                style="left:${p.x}\%; top:${p.y}%; background:${bg}; color:${color}; width:24px; height:24px; font-size:11px; 
                position:absolute; transform:translate(-50%, -50%); border-radius:50%; display:flex; align-items:center; justify-content:center; 
                font-weight:bold; border:2px solid #FFF; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.4); z-index:10;">
                ${label}
            </div>`;
        }).join('')}

        <canvas id="tactic-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:20; pointer-events:${currentTacticMode==='draw'?'auto':'none'};"></canvas>
    </div>

    <!-- CAIXA DE PEÇAS GENÉRICAS -->
    <div class="card" style="padding:12px; margin:0 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:10px; color:var(--muted); text-transform:uppercase; font-weight:bold;">CAIXA DE PEÇAS</span>
            <div style="display:flex; gap:4px;">
                <button class="btn btn-outline" style="font-size:9px; padding:3px 6px;" onclick="undoLastPath()">↩️ RISCO</button>
                <button class="btn btn-outline" style="font-size:9px; padding:3px 6px; color:var(--red); border-color:var(--red);" onclick="clearCanvasLines()">🧹 RISCOS</button>
                <button class="btn btn-outline" style="font-size:9px; padding:3px 6px;" onclick="undoLastTacticPiece()">↩️ PEÇA</button>
                <button class="btn btn-outline" style="font-size:9px; padding:3px 6px; color:var(--red); border-color:var(--red);" onclick="clearAllTacticPieces()">🗑️ PEÇAS</button>
            </div>
        </div>

        <div style="display:flex; gap:8px; margin-bottom:10px;">
            <button class="btn btn-outline" style="flex:1; font-size:11px; font-weight:bold; border-color:${teamColor}; color:${teamColor};" onclick="spawnTacticItem('own')">● Cor A</button>
            <button class="btn btn-outline" style="flex:1; font-size:11px; font-weight:bold; border-color:${oppColor}; color:${oppColor};" onclick="spawnTacticItem('opp')">● Cor B</button>
            <button class="btn btn-outline" style="flex:1; font-size:11px;" onclick="spawnTacticItem('ball')">⚽ Bola</button>
        </div>
        
        <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px dashed var(--line); padding-top:8px;">
            <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="spawnTacticItem('cone')">🔶 Cone</button>
            <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="spawnTacticItem('minigoal')">🥅 Baliza</button>
            <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="spawnTacticItem('pole')">📍 Estaca</button>
            <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="spawnTacticItem('ring')">⭕ Argola</button>
            <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="spawnTacticItem('rope')">🪜 Escada</button>
        </div>
    </div>
    
    </div>
    `;

    setTimeout(initTacticCanvas, 50);
    return html;
};

// ==========================================
// FUNÇÃO GUARDAR EXERCÍCIO
// ==========================================
window.saveTacticalPlay = function() {
    if((!state.tactics || state.tactics.length === 0) && (!state.tacticPaths || state.tacticPaths.length === 0)) {
        if(typeof showToast === 'function') showToast('O quadro está vazio!'); 
        return;
    }
    
    const playName = prompt("Nome do Exercício:");
    if(!playName || !playName.trim()) return;

    setTimeout(() => {
        const playNotes = prompt("Descrição / Notas do Exercício (Opcional):") || "";

        if(!state.tacticalNotebook) state.tacticalNotebook = [];
        
        state.tacticalNotebook.unshift({
            id: uid(),
            name: escapeHTML(playName.trim()),
            notes: escapeHTML(playNotes.trim()),
            category: 'treino',
            format: state.tacticFormat || 11,
            halfPitch: !!state.tacticHalfPitch,
            tactics: JSON.parse(JSON.stringify(state.tactics || [])),
            tacticPaths: JSON.parse(JSON.stringify(state.tacticPaths || []))
        });
        
        saveState();
        window.stratTab = 'caderno'; 
        render(); 
        
        if(typeof showToast === 'function') showToast('Exercício guardado com sucesso! 🏋️');
    }, 100);
};

// ==========================================
// RENDER DO CADERNO TÁTICO
// ==========================================
window.renderCaderno = function() {
    const notebook = (state.tacticalNotebook || []).filter(x => x.category === 'treino');
    
    let html = `<div>
        <div class="topbar">
            <h1 style="font-size:18px;">TÁTICA & VÍDEOS</h1>
        </div>
        ${taticaTabsHTML()}`;
    
    if(notebook.length === 0) {
        html += `<div class="empty">Nenhum exercício guardado no Caderno.<br><br>Desenha um esquema no Quadro e clica em "Guardar Exercício".</div>`;
    } else {
        html += `<div style="display:flex; flex-direction:column; gap:10px; padding: 0 16px;">`;
        
        notebook.forEach(play => {
            html += `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0; margin-left:0; margin-right:0;">
                    <div style="flex:1; padding-right:8px;">
                        <strong style="font-size:14px; color:var(--chalk); display:block;">${escapeHTML(play.name)}</strong>
                        ${play.notes ? `<div style="font-size:10px; color:var(--muted); margin-top:4px; font-style:italic; line-height:1.3;">${play.notes}</div>` : ''}
                        <div style="margin-top:6px;">
                            <span style="font-size:10px; color:var(--green); font-weight:bold; text-transform:uppercase;">🏋️ Exercício</span>
                            <span style="font-size:10px; color:var(--muted); margin-left:6px;">· ${play.halfPitch ? 'Meio Campo' : 'Campo Inteiro'}</span>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:6px; flex-direction:column; width: 85px;">
                        <button class="btn btn-outline" style="padding:6px; font-size:11px; text-align:center; width:100%; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="viewExerciseScheme('${play.id}')">👁️ Ver</button>
                        <button class="btn" style="background:var(--green); color:#fff; border:none; padding:6px; font-size:11px; text-align:center; width:100%; border-radius:8px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="loadTacticalPlay('${play.id}')">▶ Carregar</button>
                        <button class="btn btn-danger" style="padding:6px; font-size:11px; text-align:center; width:100%; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="if(confirm('Apagar do caderno?')) deleteTacticalPlay('${play.id}')">🗑️ Apagar</button>
                    </div>
                </div>`;
        });
        
        html += `</div>`;
    }
    html += `</div>`;
    return html;
};

// ==========================================
// BIBLIOTECA DE VÍDEOS
// ==========================================
window.renderVideos = function() {
    if (!state.videos) state.videos = [];

    let html = `<div>
        <div class="topbar">
            <h1 style="font-size:18px;">TÁTICA & VÍDEOS</h1>
        </div>
        ${taticaTabsHTML()}`;

    if (window.videoForm) {
        html += `
        <div style="padding: 0 16px;">
            <h2 style="font-size:16px; color:var(--gold); margin-bottom:12px;">${window.videoForm.id ? '✏️ Editar Vídeo' : '➕ Novo Vídeo'}</h2>
            <div class="card" style="margin:0 0 14px 0;">
                <div class="field">
                    <label>Título do Exercício / Vídeo</label>
                    <input type="text" id="vid-title" value="${escapeHTML(window.videoForm.title || '')}" placeholder="Ex: Saída sob pressão">
                </div>
                <div class="field">
                    <label>Link (URL do YouTube / Instagram)</label>
                    <input type="url" id="vid-url" value="${escapeHTML(window.videoForm.url || '')}" placeholder="https://...">
                </div>
                <div class="field" style="margin-bottom:0;">
                    <label>Descrição / Notas</label>
                    <textarea id="vid-notes" placeholder="Ex: Prestar atenção ao apoio do pé...">${escapeHTML(window.videoForm.notes || '')}</textarea>
                </div>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <button class="btn btn-outline" style="flex:1;" onclick="window.videoForm=null; render()">Cancelar</button>
                <button class="btn btn-gold" style="flex:1;" onclick="window.uiSaveVideo()">💾 Guardar</button>
            </div>
        </div>`;
    } else {
        html += `
        <div style="padding: 0 16px;">
            <button class="btn btn-gold" style="width:100%; margin-bottom:14px;" onclick="window.videoForm={title:'', url:'', notes:''}; render()">➕ GUARDAR NOVO VÍDEO</button>
            <div style="display:flex; flex-direction:column; gap:10px; padding-bottom:20px;">
        `;

        if (state.videos.length === 0) {
            html += `<div class="empty">Nenhum vídeo guardado na biblioteca.</div>`;
        } else {
            state.videos.forEach(v => {
                html += `
                <div class="card" style="margin:0; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="flex:1; padding-right:10px;">
                            <div style="font-size:14px; font-weight:bold; color:var(--chalk); margin-bottom:6px;">${escapeHTML(v.title)}</div>
                            ${v.notes ? `<div style="font-size:11px; color:var(--muted); margin-bottom:10px; line-height:1.4;">${escapeHTML(v.notes)}</div>` : ''}
                            
                            <a href="${escapeHTML(v.url)}" target="_blank" style="display:inline-block; font-size:11px; color:#000; background:var(--gold); padding:8px 14px; border-radius:6px; text-decoration:none; font-weight:bold;">
                                ▶ Abrir Link
                            </a>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <button class="btn btn-outline" style="padding:6px; font-size:12px;" onclick="window.editVideo('${v.id}')">✏️</button>
                            <button class="btn btn-outline" style="padding:6px; font-size:12px; color:var(--red); border-color:var(--red);" onclick="window.deleteVideo('${v.id}')">🗑️</button>
                        </div>
                    </div>
                </div>`;
            });
        }
        html += `</div></div>`;
    }
    html += `</div>`;
    return html;
};

window.uiSaveVideo = function() {
    const title = document.getElementById('vid-title').value.trim();
    const url = document.getElementById('vid-url').value.trim();
    const notes = document.getElementById('vid-notes').value.trim();

    if (!title || !url) {
        if(typeof showToast === 'function') showToast('Título e Link são obrigatórios!');
        return;
    }

    if (!state.videos) state.videos = [];

    if (window.videoForm && window.videoForm.id) {
        const idx = state.videos.findIndex(v => v.id === window.videoForm.id);
        if (idx !== -1) {
            state.videos[idx] = { ...state.videos[idx], title, url, notes };
        }
    } else {
        state.videos.unshift({ id: uid(), title, url, notes });
    }

    window.videoForm = null;
    saveState();
    render();
    if(typeof showToast === 'function') showToast('✅ Vídeo guardado!');
};

window.editVideo = function(id) {
    const v = state.videos.find(x => x.id === id);
    if (!v) return;
    window.videoForm = { ...v };
    render();
};

window.deleteVideo = function(id) {
    if(confirm('Apagar este vídeo da biblioteca?')) {
        state.videos = state.videos.filter(v => v.id !== id);
        saveState();
        render();
        if(typeof showToast === 'function') showToast('🗑️ Vídeo apagado!');
    }
};

// ==========================================
// OUTRAS FUNÇÕES DO QUADRO TÁTICO
// ==========================================
window.loadTacticalPlay = function(id) {
    const play = (state.tacticalNotebook || []).find(x => x.id === id);
    if(!play) return;
    state.tacticFormat = play.format || 11;
    state.tacticHalfPitch = !!play.halfPitch;
    state.tactics = JSON.parse(JSON.stringify(play.tactics || []));
    state.tacticPaths = JSON.parse(JSON.stringify(play.tacticPaths || []));
    saveState();
    window.stratTab = 'quadro'; 
    render();
    if(typeof showToast === 'function') showToast(`Carregado: ${play.name}`);
};

window.deleteTacticalPlay = function(id) {
    state.tacticalNotebook = (state.tacticalNotebook || []).filter(x => x.id !== id);
    saveState();
    render();
    if(typeof showToast === 'function') showToast('Item eliminado.');
};

window.exportTacticPDF = function() {
    if ((!state.tactics || state.tactics.length === 0) && (!state.tacticPaths || state.tacticPaths.length === 0)) {
        if(typeof showToast === 'function') showToast('O quadro está vazio!'); 
        return;
    }

    if(typeof showToast === 'function') showToast('A preparar PDF... ⏳');

    const isHalf = !!state.tacticHalfPitch;
    const teamColor = state.teamColor || '#D9A441';
    const oppColor = state.oppColor || '#C8493F';
    const coneColor = '#FF9500'; 
    const getConstrast = typeof getContrastColor === 'function' ? getContrastColor : () => '#000';

    let piecesSVG = '';
    (state.tactics || []).forEach(p => {
        let bg = p.kind === 'own' ? teamColor : (p.kind === 'opp' ? oppColor : coneColor);
        let color = p.kind === 'own' ? getConstrast(teamColor) : getConstrast(oppColor);
        
        const cx = Number.isFinite(Number(p.x)) ? Number(p.x) : 50;
        const cy = Number.isFinite(Number(p.y)) ? Number(p.y) : 50;
        const svgY = (cy / 100) * 75; 

        if (['cone', 'minigoal', 'pole', 'rope', 'ball', 'ring'].includes(p.kind)) {
            let svgContent = typeof getTacticItemSVG === 'function' ? getTacticItemSVG(p) : '';
            piecesSVG += `<g transform="translate(${cx}, ${svgY}) scale(0.22)">${svgContent}</g>`;
        } else {
            let label = escapeHTML(p.label || '');
            piecesSVG += `
                <circle cx="${cx}" cy="${svgY}" r="2.2" fill="${bg}" stroke="#FFF" stroke-width="0.3" />
                <text x="${cx}" y="${svgY + 0.7}" fill="${color}" font-size="2" font-weight="bold" font-family="sans-serif" text-anchor="middle">${label}</text>
            `;
        }
    });

    let pathsSVG = '';
    (state.tacticPaths || []).forEach(path => {
        if (!path.points || path.points.length === 0) return;
        const pts = path.points.map(pt => `${pt.x},${(pt.y / 100) * 75}`).join(' ');
        pathsSVG += `<polyline points="${pts}" fill="none" stroke="${path.color}" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" />`;
    });

    const boardHTML = `
        <div style="width:100%; aspect-ratio:4/3; background:#113821; border-radius:6px; overflow:hidden; position:relative; -webkit-print-color-adjust:exact; print-color-adjust:exact; border: 2px solid #000;">
          <svg viewBox="0 0 100 75" style="width:100%; height:100%; display:block;">
            ${typeof getPitchSVG === 'function' ? getPitchSVG(isHalf) : ''}
            ${pathsSVG}
            ${piecesSVG}
          </svg>
        </div>`;

    const logoHtml = state.clubLogo 
        ? `<img src="${state.clubLogo}" style="height:50px; width:auto; object-fit:contain;">` 
        : `<div style="font-size:40px; opacity:0.3;">🛡️</div>`;

    const html = `
        <div class="print-card" style="padding:20px; font-family:-apple-system, sans-serif; background:#fff; color:#000;">
            <div class="print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:20px;">
                <div>
                    <h1 style="font-size:20px; margin:0; text-transform:uppercase;">${state.myClubName || 'A Minha Equipa'} — ESQUEMA TÁTICO</h1>
                    <p style="font-size:12px; color:#555; margin:4px 0 0 0;">Gerado em: ${new Date().toLocaleDateString('pt-PT')} | Época: ${state.currentSeason}</p>
                </div>
                ${logoHtml}
            </div>
            ${boardHTML}
            <div style="margin-top:20px; font-size:11px; color:#666; text-align:center; border-top:1px solid #ccc; padding-top:10px;">
                Coachfolio GK Pro — Documento Tático
            </div>
        </div>`;

    let printArea = document.getElementById('print-area');
    if (!printArea) {
        printArea = document.createElement('div');
        printArea.id = 'print-area';
        document.body.appendChild(printArea);
    }
    
    printArea.innerHTML = html;
    printArea.style.display = 'block';

    if (typeof window.openSafePrintModal === 'function') {
        window.openSafePrintModal();
    } else {
        setTimeout(() => {
            window.print();
            setTimeout(() => { printArea.style.display = 'none'; printArea.innerHTML = ''; }, 1000);
        }, 150);
    }
};

function initTacticCanvas() {
    const cvs = document.getElementById('tactic-canvas'); 
    if(!cvs) return;
    const rect = cvs.getBoundingClientRect();
    
    if (cvs.width !== rect.width || cvs.height !== rect.height) {
        cvs.width = rect.width; 
        cvs.height = rect.height;
    }
    
    tacticCtx = cvs.getContext('2d'); 
    redrawCanvas();
}

window.addEventListener('resize', () => {
    if (typeof currentTab !== 'undefined' && currentTab === 'tatica') {
        setTimeout(initTacticCanvas, 100);
    }
});

function redrawCanvas() {
    if(!tacticCtx || !tacticCtx.canvas.width) return; 
    tacticCtx.clearRect(0, 0, tacticCtx.canvas.width, tacticCtx.canvas.height); 
    tacticCtx.lineCap = 'round'; 
    tacticCtx.lineJoin = 'round'; 
    tacticCtx.lineWidth = 3;
    (state.tacticPaths || []).forEach(path => { 
        if(path.points.length === 0) return; 
        tacticCtx.strokeStyle = path.color; 
        tacticCtx.beginPath(); 
        path.points.forEach((p, index) => { 
            const x = (p.x / 100) * tacticCtx.canvas.width; 
            const y = (p.y / 100) * tacticCtx.canvas.height; 
            if(index === 0) tacticCtx.moveTo(x, y); 
            else tacticCtx.lineTo(x, y); 
        }); 
        tacticCtx.stroke(); 
    });
}

document.addEventListener('touchstart', handleDrawStart, {passive: false}); 
document.addEventListener('mousedown', handleDrawStart);
document.addEventListener('touchmove', handleDrawMove, {passive: false}); 
document.addEventListener('mousemove', handleDrawMove);
document.addEventListener('touchend', handleDrawEnd); 
document.addEventListener('mouseup', handleDrawEnd);

function handleDrawStart(e) { 
    if(typeof currentTab === 'undefined' || currentTab !== 'tatica' || currentTacticMode !== 'draw') return; 
    const cvs = document.getElementById('tactic-canvas'); 
    if(!cvs || e.target !== cvs) return; 
    isDrawing = true; 
    if(!state.tacticPaths) state.tacticPaths = []; 
    state.tacticPaths.push({ color: currentDrawColor, points: [] }); 
    handleDrawMove(e); 
}

function handleDrawMove(e) { 
    if(!isDrawing || typeof currentTab === 'undefined' || currentTab !== 'tatica' || currentTacticMode !== 'draw') return; 
    e.preventDefault(); 
    const pos = getTouchPos(e); 
    const cvs = document.getElementById('tactic-canvas'); 
    const rect = cvs.getBoundingClientRect(); 
    let pctX = ((pos.x - rect.left) / rect.width) * 100; 
    let pctY = ((pos.y - rect.top) / rect.height) * 100; 
    
    pctX = Math.round(Math.max(0, Math.min(100, pctX)) * 10) / 10;
    pctY = Math.round(Math.max(0, Math.min(100, pctY)) * 10) / 10;
    
    const currentPath = state.tacticPaths[state.tacticPaths.length - 1]; 
    currentPath.points.push({x: pctX, y: pctY}); 
    redrawCanvas(); 
}

function handleDrawEnd(e) { 
    if(!isDrawing || typeof currentTab === 'undefined' || currentTab !== 'tatica') return; 
    isDrawing = false; 
    saveState(); 
}

let dragObj = { dragging: false, id: null, el: null, pitchRect: null };

function getTouchPos(e) { 
    const touch = e.touches && e.touches.length > 0 ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e); 
    return { x: touch.clientX, y: touch.clientY }; 
}

document.addEventListener('touchstart', startDrag, {passive: false}); 
document.addEventListener('mousedown', startDrag);
document.addEventListener('touchmove', moveDrag, {passive: false}); 
document.addEventListener('mousemove', moveDrag);
document.addEventListener('touchend', endDrag); 
document.addEventListener('mouseup', endDrag);

function startDrag(e) { 
    if (typeof currentTab === 'undefined' || currentTab !== 'tatica' || currentTacticMode !== 'move') return; 
    const piece = e.target.closest('.tactic-piece'); 
    if (!piece) return; 
    const pitchEl = document.getElementById('tactic-pitch'); 
    if (!pitchEl) return; 
    dragObj.dragging = true; 
    dragObj.el = piece; 
    dragObj.id = piece.dataset.id; 
    dragObj.pitchRect = pitchEl.getBoundingClientRect(); 
    piece.style.transition = 'none'; 
    piece.style.zIndex = 1000; 
}

let rafId = null;

function moveDrag(e) {
    if (!dragObj.dragging || typeof currentTab === 'undefined' || currentTab !== 'tatica' || currentTacticMode !== 'move') return;
    e.preventDefault();
    
    if (rafId) cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
        const pos = getTouchPos(e);
        let relX = pos.x - dragObj.pitchRect.left;
        let relY = pos.y - dragObj.pitchRect.top;
        
        let pctX = Math.round(((relX / dragObj.pitchRect.width) * 100) * 10) / 10;
        let pctY = Math.round(((relY / dragObj.pitchRect.height) * 100) * 10) / 10;
        
        pctX = Math.max(0, Math.min(100, pctX));
        pctY = Math.max(0, Math.min(100, pctY));
        
        dragObj.el.style.left = pctX + '%';
        dragObj.el.style.top = pctY + '%';
    });
}

function endDrag(e) {
    if (!dragObj.dragging || typeof currentTab === 'undefined' || currentTab !== 'tatica') return;
    
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    
    dragObj.dragging = false;
    
    const pos = getTouchPos(e);
    let relX = pos.x - dragObj.pitchRect.left;
    let relY = pos.y - dragObj.pitchRect.top;
    
    let pctX = Math.round(((relX / dragObj.pitchRect.width) * 100) * 10) / 10;
    let pctY = Math.round(((relY / dragObj.pitchRect.height) * 100) * 10) / 10;
    
    if (pctX < -10 || pctX > 110 || pctY < -10 || pctY > 110) {
        state.tactics = state.tactics.filter(i => i.id !== dragObj.id);
    } else {
        const item = state.tactics.find(i => i.id === dragObj.id);
        if (item) {
            item.x = Math.max(0, Math.min(100, pctX));
            item.y = Math.max(0, Math.min(100, pctY));
        }
    }
    
    dragObj.el.style.zIndex = '';
    saveState();
    render();
}