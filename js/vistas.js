// ==========================================
// COACHFOLIO GK PRO — Funções Auxiliares Globais
// ==========================================

function renderModalHTML(){
  if (typeof t !== 'function') { window.t = function(key) { return key; }; }
  if(!modalConfig) return '';
  
  if (modalConfig && modalConfig.type === 'exerciseSelector') {
    const exercises = (state.tacticalNotebook || []).filter(x => x.category === 'treino');
    const query = (window.exerciseSearchQuery || '').trim().toLowerCase();
    const filtered = exercises.filter(ex => !query || ex.name.toLowerCase().includes(query));
    return `
      <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
        <div class="modal-card" style="max-width:440px; text-align:left;">
          <h3 style="margin-top:0; color:var(--gold); text-align:center;">🏋️ Selecionar Exercício</h3>
          <div class="field" style="margin-bottom:12px;">
            <input type="text" placeholder="Pesquisar exercício..." value="${window.exerciseSearchQuery || ''}" oninput="updateExerciseSearch(this.value)">
          </div>
          <div id="exercise-list" style="max-height:55vh; overflow-y:auto; padding-right:4px; display:flex; flex-direction:column; gap:8px;">
            ${filtered.length > 0 ? filtered.map(ex => `
              <div style="background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:bold; color:var(--chalk); font-size:13px;">${ex.name}</div>
                  <div style="font-size:10px; color:var(--muted);">${ex.halfPitch ? 'Meio Campo' : 'Campo Inteiro'}</div>
                </div>
                <button class="btn btn-green" style="flex:none; width:auto; font-size:9px; padding:4px 8px;" onclick="addExerciseToTraining('${ex.id}', 15)">Importar</button>
              </div>
            `).join('') : `<div class="empty">Nenhum exercício encontrado.</div>`}
          </div>
          <button class="btn btn-outline" style="width:100%; margin-top:14px;" onclick="closeModal()">Cancelar</button>
        </div>
      </div>`;
  }
  
  if(modalConfig.type === 'settings') {
    const sizeKB = (JSON.stringify(state).length / 1024); const maxKB = 5120; const pct = Math.min(100, (sizeKB/maxKB)*100);
    let strColor = pct > 90 ? 'var(--red)' : (pct > 50 ? 'var(--yellow)' : 'var(--green)');
    window.settingsTab = window.settingsTab !== undefined ? window.settingsTab : null;
    
    const makeAccordion = (id, icon, title, content) => {
        const isOpen = window.settingsTab === id;
        return `
        <div style="margin:0; padding:0; flex-shrink:0; border-radius:12px; border:1px solid var(--line); background:var(--surface-2); text-align:left; overflow:hidden;">
            <div style="padding:14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:${isOpen ? 'var(--surface)' : 'transparent'}; border-bottom:${isOpen ? '1px solid var(--line)' : 'none'};" 
                 onclick="window.settingsTab = window.settingsTab === '${id}' ? null : '${id}'; document.getElementById('modal-root').innerHTML = renderModalHTML();">
                <div style="font-size:12px; color:var(--gold); font-weight:bold; text-transform:uppercase; margin:0; line-height:1; display:flex; align-items:center; gap:6px;">
                   <span>${icon}</span> <span>${title}</span>
                </div>
                <div style="color:var(--gold); font-size:14px; transition: transform 0.2s; line-height:1;">${isOpen ? '▼' : '▶'}</div>
            </div>
            ${isOpen ? `<div style="padding:14px; animation: fadeIn 0.2s ease-in-out;">${content}</div>` : ''}
        </div>
        `;
    };
    
    const contentIdentidade = `
    <div class="field" style="margin-bottom:12px;"> 
      <label>Nome do Teu Clube</label> 
      <div style="display:flex; gap:8px;"> 
        <input type="text" value="${state.myClubName || ''}" oninput="state.myClubName=this.value; saveState();" placeholder="Nome do Clube" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
              ${state.clubNameLocked ? 'disabled' : ''} 
              style="flex:1; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box; opacity:${state.clubNameLocked ? '0.6' : '1'};"> 
        <button class="btn btn-outline" style="flex:none; padding:0 14px;" 
                onclick="event.stopPropagation(); state.clubNameLocked = !state.clubNameLocked; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">
          ${state.clubNameLocked ? '🔒' : '✏️'}
        </button> 
      </div> 
    </div> 
    
    <div class="field" style="margin-bottom:12px;"> 
      <label>Escalão / Categoria</label> 
      <div style="display:flex; gap:8px;"> 
        <input type="text" value="${state.escalao || ''}" oninput="state.escalao=this.value; saveState();" placeholder="Ex: Seniores, Sub-19..." style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
              ${state.escalaoLocked ? 'disabled' : ''} 
              style="flex:1; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box; opacity:${state.escalaoLocked ? '0.6' : '1'};"> 
        <button class="btn btn-outline" style="flex:none; padding:0 14px;" 
                onclick="event.stopPropagation(); state.escalaoLocked = !state.escalaoLocked; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">
          ${state.escalaoLocked ? '🔒' : '✏️'}
        </button> 
      </div> 
    </div> 

    <div class="field" style="margin-bottom:0;"> 
      <label>Emblema / Logótipo</label> 
      <div style="display:flex; align-items:center; gap:8px; margin-top:4px;"> 
        <div style="width:50px; height:50px; background:var(--surface-2); border:1px dashed var(--line); border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
          ${state.clubLogo ? `<img src="${state.clubLogo}" style="width:100%; height:100%; object-fit:contain;">` : '<span style="font-size:20px; opacity:0.3;">🛡️</span>'}
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
          <div style="display:flex; gap:6px;">
            <input type="file" id="club-logo-upload" accept="image/*" style="display:none;" onchange="window.uploadClubLogo(event)" ${state.clubLogoLocked ? 'disabled' : ''}>
            <button class="btn btn-outline" style="flex:1; font-size:11px; padding:8px; opacity:${state.clubLogoLocked ? '0.5' : '1'};" onclick="document.getElementById('club-logo-upload').click()">Carregar</button>
            ${state.clubLogo && !state.clubLogoLocked ? `<button class="btn btn-red" style="flex:1; font-size:11px; padding:8px;" onclick="state.clubLogo=null; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Remover</button>` : ''}
          </div>
          <button class="btn btn-outline" style="width:100%; font-size:10px; padding:6px;" onclick="event.stopPropagation(); state.clubLogoLocked = !state.clubLogoLocked; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">
            ${state.clubLogoLocked ? '🔒 Alterações Bloqueadas' : '✏️ Permite Alterações'}
          </button>
        </div>
      </div>
    </div>
  `;
    
    const contentTatica = `
     <div class="field" style="margin-bottom:12px;">
         <label>⚽ Modalidade Base</label>
         <div style="display:flex; gap:10px; margin-top:8px;">
           <div style="flex:1; cursor:pointer; border:2px solid ${state.gameMode==='futsal'?'var(--gold)':'var(--line)'}; border-radius:8px; padding:12px; text-align:center; background:${state.gameMode==='futsal'?'var(--gold-dim)':'var(--surface)'};" onclick="state.gameMode='futsal'; state.defaultHalfDuration=20; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML(); if(typeof render === 'function') render();">
             <div style="font-size:11px; font-weight:bold; color:var(--gold);">FUTSAL</div>
             ${state.gameMode==='futsal' ? '<div style="font-size:16px; color:var(--gold); margin-top:4px;">✓</div>' : ''}
           </div>
           
           <div style="flex:1; cursor:pointer; border:2px solid ${state.gameMode==='futebol'?'var(--gold)':'var(--line)'}; border-radius:8px; padding:12px; text-align:center; background:${state.gameMode==='futebol'?'var(--gold-dim)':'var(--surface)'};" onclick="state.gameMode='futebol'; state.defaultHalfDuration=45; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML(); if(typeof render === 'function') render();">
             <div style="font-size:11px; font-weight:bold; color:var(--gold);">FUTEBOL</div>
             ${state.gameMode==='futebol' ? '<div style="font-size:16px; color:var(--gold); margin-top:4px;">✓</div>' : ''}
           </div>
         </div>
     </div>

     <div class="field" style="margin-bottom:12px;">
         <label>Tempo Padrão por Parte (Minutos)</label>
         <div style="display:flex; gap:8px;">
            <input id="tempo-input" type="number" placeholder="Ex: 20" value="${state.defaultHalfDuration||20}" disabled style="opacity:0.6;" onchange="state.defaultHalfDuration=parseInt(this.value, 10)||20; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML(); if(typeof render === 'function') render();">
            <button class="btn btn-outline" style="flex:none; padding:0 14px;" onclick="event.stopPropagation(); const inp = document.getElementById('tempo-input'); inp.disabled = !inp.disabled; inp.style.opacity = inp.disabled ? '0.6' : '1'; if(!inp.disabled) inp.focus();">🔒</button>
         </div>
     </div>

      <div class="field" style="margin-bottom:12px;">
          <label>COR A</label>
          <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;">
              ${['#D9A441','#C8493F','#4ade80','#3b82f6','#FFFFFF','#111111'].map(c => `
                  <div style="width:28px; height:28px; background:${c}; border-radius:50%; border:2px solid ${state.teamColor===c?'var(--gold)':'transparent'}; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center;" 
                      onclick="event.stopPropagation(); state.teamColor='${c}'; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">
                      ${state.teamColor === c ? `<span style="color:${c==='#111111'?'#FFF':'#000'}; font-size:14px; font-weight:bold;">✓</span>` : ''}
                  </div>
              `).join('')}
          </div>
      </div>

      <div class="field" style="margin-bottom:0;">
          <label>COR B</label>
          <div style="display:flex; gap:8px; margin-top:6px; flex-wrap:wrap;">
              ${['#D9A441','#C8493F','#4ade80','#3b82f6','#FFFFFF','#111111'].map(c => `
                  <div style="width:28px; height:28px; background:${c}; border-radius:50%; border:2px solid ${state.oppColor===c?'var(--gold)':'transparent'}; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center;" 
                      onclick="event.stopPropagation(); state.oppColor='${c}'; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">
                      ${state.oppColor === c ? `<span style="color:${c==='#111111'?'#FFF':'#000'}; font-size:14px; font-weight:bold;">✓</span>` : ''}
                  </div>
              `).join('')}
          </div>
      </div>
  `; 
    
    const contentModulos = `
       <div class="field" style="margin-bottom:12px;">
           <label>Idioma da Aplicação</label>
           <div class="seg">
               <div class="seg-btn ${state.lang==='pt'?'active':''}" onclick="event.stopPropagation(); state.lang='pt'; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Português</div>
               <div class="seg-btn ${state.lang==='en'?'active':''}" onclick="event.stopPropagation(); state.lang='en'; saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML();">English</div>
           </div>
       </div>
       
       <div class="field" style="margin-bottom:12px;">
           <label>Tema Visual</label>
           <div class="seg">
               <div class="seg-btn ${state.theme==='original'?'active':''}" onclick="event.stopPropagation(); state.theme='original'; saveState(); window.applyTheme(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Floresta</div>
               <div class="seg-btn ${state.theme==='luzsolar'?'active':''}" onclick="event.stopPropagation(); state.theme='luzsolar'; saveState(); window.applyTheme(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Sol</div>
               <div class="seg-btn ${state.theme==='oceanonoturno'?'active':''}" onclick="event.stopPropagation(); state.theme='oceanonoturno'; saveState(); window.applyTheme(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Oceano</div>
           </div>
       </div>
       
       <div class="field" style="margin-bottom:0;">
           <label>Ecrã Sempre Ligado (Evita bloqueio do telemóvel)</label>
           <div class="seg">
               <div class="seg-btn ${state.keepScreenAwake?'active':''}" onclick="event.stopPropagation(); state.keepScreenAwake=true; saveState(); window.manageWakeLock(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Sim</div>
               <div class="seg-btn ${!state.keepScreenAwake?'active':''}" onclick="event.stopPropagation(); state.keepScreenAwake=false; saveState(); window.manageWakeLock(); document.getElementById('modal-root').innerHTML = renderModalHTML();">Não</div>
           </div>
       </div>
    `;
    
    const contentEpoca = `
       <div style="text-align:center; margin-bottom:16px;">
          <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-bottom:4px; font-weight:bold;">Nome da Época Atual</div>
          <div style="font-size:22px; font-weight:bold; color:var(--chalk);">${state.currentSeason}</div>
       </div>

       <div class="field" style="margin-bottom:16px;">
           <label>Formato da Época Atual</label>
           <div class="seg">
              <div class="seg-btn ${state.seasonFormat==='europeu'?'active':''}" onclick="event.stopPropagation(); window.setSeasonFormat('europeu');">Europeu (ex: 26/27)</div>
              <div class="seg-btn ${state.seasonFormat==='civil'?'active':''}" onclick="event.stopPropagation(); window.setSeasonFormat('civil');">Ano Civil (ex: 2026)</div>
           </div>
       </div>
       
       <button class="btn btn-red" style="width:100%; font-size:12px;" onclick="event.stopPropagation(); if(typeof archiveSeason === 'function') archiveSeason(); else alert('Arquivo em desenvolvimento.');">📦 Arquivar Época (Inicia nova época a zero)</button>
    `;
    
    return `
    <style>
      @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    <div class="modal-overlay" style="padding: 10px;" onclick="if(event.target===this) closeModal()">
      <div class="modal-card" style="max-height: 85vh; display: flex; flex-direction: column; padding: 16px; max-width: 480px; position: relative; z-index: 10000;">
        <h3 style="margin-top:0; margin-bottom:12px; color:var(--gold); flex-shrink:0;">Definições</h3>
        
        <div style="flex: 1; overflow-y: auto; padding-right: 4px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px;">
            ${makeAccordion('identidade', '🛡️', 'Identidade do Clube', contentIdentidade)}
            ${makeAccordion('tatica', '📋', 'Tática e Jogo', contentTatica)}
            ${makeAccordion('modulos', '📱', 'Interface & Sistema', contentModulos)}
            ${makeAccordion('epoca', '📅', 'Gestão de Época', contentEpoca)}
            
            <div style="flex-shrink:0; margin:4px 0 0 0; padding:14px; border-radius:12px; border:1px dashed var(--line); background:var(--surface-2); text-align:left;">
              <div style="font-size:11px; color:var(--chalk); font-weight:bold; text-transform:uppercase; margin-bottom:8px;">💾 Dados & Backups</div>
              <div style="font-size:10px; color:var(--muted); margin-bottom:12px; line-height:1.4;">Para evitar a perda de dados, exporta um backup regularmente.</div>
              <div style="display:flex; gap:8px; margin-top:12px; margin-bottom:12px;">
                <button class="btn btn-gold" style="font-size:11px; font-weight:bold; flex:1;" onclick="event.stopPropagation(); window.exportDataJSON();">📥 Exportar</button>
                <label class="btn btn-outline" style="font-size:11px; font-weight:bold; flex:1; margin:0; cursor:pointer; text-align:center;">
                  📤 Importar
                  <input type="file" id="json-file-input" accept=".json" style="display:none;" onchange="window.importData(this)">
                </label>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--muted); text-transform:uppercase; font-weight:bold; margin-bottom:4px;"><span>Armazenamento</span><span>${sizeKB.toFixed(1)} KB / ~5 MB</span></div>
              <div style="height:6px; background:var(--surface); border-radius:3px; overflow:hidden; margin-bottom:12px;"><div style="height:100%; width:${pct}%; background:${strColor};"></div></div>
              <button class="btn btn-red" style="width:100%; font-size:12px;" onclick="event.stopPropagation(); window.wipeAllData();">🗑️ Limpar Dados (Reset)</button>
            </div>
        </div>
        
        <div style="flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;">
            <button class="btn" style="width:100%; background:#0E211A; color:#fff; border:1px solid var(--line); font-size:11px; padding:10px;" onclick="window.abrirCreditos()">🤝 Créditos & Parceiros</button>
            <button class="btn btn-outline" style="width:100%; font-size:12px; padding:10px;" onclick="closeModal()">Fechar</button>
        </div>
      </div>
    </div>`;
  }
  
  if(modalConfig.type === 'creditos') {
    return `
    <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
      <div class="modal-card" style="max-width:350px; text-align:center; padding:30px 20px;">
        <h3 style="margin-top:0; color:var(--gold); font-size:18px;">🤝 Créditos & Parceiros</h3>
        
        <div style="margin:24px 0;">
            <div style="font-size:20px; font-weight:900; color:var(--chalk); letter-spacing:1px;">COACHFOLIO</div>
            <div style="font-size:14px; font-weight:bold; color:var(--gold); margin-bottom:12px;">GK PRO</div>
            <p style="font-size:12px; color:var(--muted); font-style:italic;">"Feito por treinadores,<br>para treinadores de Guarda-Redes."</p>
        </div>
        
        <div style="margin-bottom:24px; padding:16px; background:var(--surface-2); border-radius:12px; border:1px solid var(--line);">
            <p style="font-size:10px; color:var(--muted); text-transform:uppercase; font-weight:bold; margin-bottom:4px;">Ideia Original e Autoria</p>
            <p style="font-size:16px; color:var(--gold); font-weight:bold; margin-bottom:16px;">Pedro Silva</p>
            
            <p style="font-size:10px; color:var(--muted); text-transform:uppercase; font-weight:bold; margin-bottom:8px;">Baseado na App Original</p>
            <a href="https://instagram.com/coachfolio.app" target="_blank" style="display:inline-block; font-size:13px; color:#000; background:var(--gold); font-weight:bold; text-decoration:none; padding:10px 20px; border-radius:8px;">
                @coachfolio.app
            </a>
        </div>
        
        <button class="btn btn-outline" style="width:100%;" onclick="closeModal()">Fechar</button>
      </div>
    </div>`;
  }

  if(modalConfig.type === 'safePrint') {
    return `<div class="modal-overlay"> <div class="modal-card" style="padding: 30px 20px;"> <div style="font-size:40px; margin-bottom:10px;">📄</div> <h3 style="margin-top:0; color:var(--gold);">Relatório Gerado</h3> <p style="font-size:13px; color:var(--chalk); margin-bottom:20px;">O teu relatório está pronto. Clica abaixo para abrir, imprimir ou guardar nos ficheiros do telemóvel.</p> <button class="btn btn-gold" style="width:100%; font-size:15px; padding:12px;" onclick="triggerSafePrint();">🖨️ Abrir / Partilhar / Imprimir</button> <button class="btn btn-outline" style="width:100%; margin-top:10px;" onclick="document.getElementById('print-area').innerHTML=''; closeModal();">Fechar</button> </div> </div>`;
  }
  if(modalConfig.type === 'safeShare') {
    return `<div class="modal-overlay"> <div class="modal-card" style="padding: 30px 20px;"> <div style="font-size:40px; margin-bottom:10px;">✅</div> <h3 style="margin-top:0; color:var(--gold);">Tática Preparada</h3> <p style="font-size:13px; color:var(--chalk); margin-bottom:20px;">O esquema tático foi desenhado. Clica abaixo para partilhar ou guardar na galeria.</p> <button class="btn btn-green" style="width:100%; font-size:15px; padding:12px;" onclick="triggerSafeShare()">📲 Partilhar / Guardar</button> <button class="btn btn-outline" style="width:100%; margin-top:10px;" onclick="window.pendingShareFile=null; closeModal();">Cancelar</button> </div> </div>`;
  }
  return `<div class="modal-overlay"><div class="modal-card"><p>${modalConfig.message}</p><div style="display:flex; gap:10px;"><button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn ${modalConfig.btnClass || 'btn-red'}" onclick="window.confirmModal();">Confirmar</button></div></div></div>`;
}

// ==========================================
// FUNÇÕES DE TEMAS E SISTEMA
// ==========================================

window.applyTheme = function() {
    const root = document.documentElement;
    if (state.theme === 'luzsolar') {
        root.style.setProperty('--bg', '#F3F4F6');
        root.style.setProperty('--surface', '#FFFFFF');
        root.style.setProperty('--surface-2', '#E5E7EB');
        root.style.setProperty('--line', '#D1D5DB');
        root.style.setProperty('--chalk', '#111827');
        root.style.setProperty('--muted', '#6B7280');
    } else if (state.theme === 'oceanonoturno') {
        root.style.setProperty('--bg', '#0F172A');
        root.style.setProperty('--surface', '#1E293B');
        root.style.setProperty('--surface-2', '#334155');
        root.style.setProperty('--line', '#475569');
        root.style.setProperty('--chalk', '#F8FAFC');
        root.style.setProperty('--muted', '#94A3B8');
    } else {
        root.style.setProperty('--bg', '#0E211A');
        root.style.setProperty('--surface', '#142E24');
        root.style.setProperty('--surface-2', '#1A3A2E');
        root.style.setProperty('--line', '#2A4A3E');
        root.style.setProperty('--chalk', '#F3EFE6');
        root.style.setProperty('--muted', '#8FA79B');
    }
};

let wakeLock = null;
window.manageWakeLock = async function() {
    if (!('wakeLock' in navigator)) { return; }
    try {
        if (state.keepScreenAwake) {
            if (!wakeLock) {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => { wakeLock = null; });
            }
        } else {
            if (wakeLock) { await wakeLock.release(); wakeLock = null; }
        }
    } catch (err) { console.error('Erro no Wake Lock:', err); }
};

document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') { window.manageWakeLock(); }
});

setTimeout(() => {
    if(typeof window.applyTheme === 'function') window.applyTheme();
    if(typeof window.manageWakeLock === 'function') window.manageWakeLock();
}, 200);

// ==========================================
// FUNÇÕES AUXILIARES DE DEFINIÇÕES E GLOBAIS
// ==========================================

window.setSeasonFormat = function(format) {
    state.seasonFormat = format;
    const year = new Date().getFullYear();
    if (format === 'civil') {
        state.currentSeason = year.toString();
    } else {
        const nextYear = (year + 1).toString().slice(-2);
        const thisYear = year.toString().slice(-2);
        state.currentSeason = `${thisYear}/${nextYear}`;
    }
    saveState();
    document.getElementById('modal-root').innerHTML = renderModalHTML();
    if (typeof render === 'function') render();
};

window.uploadClubLogo = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (typeof showToast === 'function') showToast('A otimizar emblema... ⏳');
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 150; 
      let width = img.width; let height = img.height;
      if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
      else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      state.clubLogo = canvas.toDataURL('image/png'); 
      saveState(); document.getElementById('modal-root').innerHTML = renderModalHTML(); 
      if (typeof showToast === 'function') showToast('✅ Emblema carregado!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
};

window.openSettings = function() {
  modalConfig = { type: 'settings' };
  const root = document.getElementById('modal-root');
  if (root) {
    try { root.innerHTML = renderModalHTML(); } 
    catch (e) { root.innerHTML = '<div class="modal-overlay"><div class="modal-card"><p>Erro ao carregar definições.</p><button class="btn btn-outline" onclick="closeModal()">Fechar</button></div></div>'; }
  }
};

window.closeModal = function() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    modalConfig = null;
};

function topbarHtml(title){
  return `<div class="topbar"><div style="display:flex; align-items:center;"><span class="topbar-home" onclick="if(typeof navigate === 'function') navigate('home')" title="Início"><span class="topbar-home-icon">${ballIconSvg()}</span><span class="topbar-home-label">Início</span></span><h1 style="margin-left:10px;">${title}</h1></div><span class="topbar-settings" onclick="window.openSettings()">⚙️</span></div>`;
}

function ballIconSvg(){ 
  return `<svg style="width:100%; height:100%;" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--gold)" stroke-width="4"/><polygon points="50,29 63,39 58,55 42,55 37,39" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linejoin="round"/><path d="M50 29 L50 9 M63 39 L81 30 M58 55 L71 71 M42 55 L29 71 M37 39 L19 30" stroke="var(--gold)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`; 
}

window.matchNarrativeHtml = function(m, isLocked = false){
  const tm = m.timeline || {}; const cards = m.cards || []; const subs = m.subs || []; 
  const eventsForHalf = (half) => {
    const goals = m.goals.filter(g=>g.half===half).map(g=>({ type:'goal', minute:g.minute, timestamp:g.timestamp||0, data:g }));
    const cds = cards.filter(c=>c.half===half).map(c=>({ type:'card', minute:c.minute, timestamp:c.timestamp||0, data:c }));
    const sbs = subs.filter(s=>s.half===half || (half===1 && s.isHalftime)).map(s=>({ type:'sub', minute:s.isHalftime?'INT':s.minute, timestamp:s.timestamp||0, data:s, isHalftime: s.isHalftime }));
    return [...goals, ...cds, ...sbs].sort((a,b)=>{
      if(a.isHalftime && !b.isHalftime) return 1;
      if(!a.isHalftime && b.isHalftime) return -1;
      const minA = a.minute==null?999:a.minute;
      const minB = b.minute==null?999:b.minute;
      if(minA !== minB) return minA - minB;
      return a.timestamp - b.timestamp;
    });
  };
  const formatExactHalf = (ms) => {
    if(ms == null) return '';
    const totalSecs = Math.floor(ms / 1000); const mm = Math.floor(totalSecs / 60); const ss = totalSecs % 60;
    return `(️ ${mm}' ${String(ss).padStart(2,'0')}'' )`;
  };
  const goalRow = (g) => {
    let subTag = g.goalSubtype === 'penalti' ? ' (Penálti)' : (g.goalSubtype === 'autogolo' ? ' (Autogolo)' : (g.goalSubtype === 'livre' ? ' (Livre)' : ''));
    let desc = '';
    if (g.type === 'scored') {
       if (g.scorerId === 'autogolo') {
         desc = `⚽ Autogolo (Adversário)`;
       } else {
         desc = `⚽ ${playerName(g.scorerId)}${subTag}${g.assistId && g.assistId !== 'none' ? ' (ast. ' + playerName(g.assistId) + ')' : ''}`;
       }
     } else {
       let ownGoalPlayer = g.scorerId ? ` [${playerName(g.scorerId)}]` : '';
       desc = ` Sofrido${subTag}${ownGoalPlayer}`;
     }
     return `<div class="goal-row">
       <span>
         ${g.minute != null ? `<span class="mono" style="color:var(--gold);">${window.getGlobalMinuteDisplay(m, g.half, g.minute)}'</span> ` : ''}
         ${desc}
       </span>
       ${!isLocked ? `<span><button class="del" style="color:var(--muted); margin-right:2px;" onclick="event.stopPropagation(); editEventMinute('${m.id}','goal','${g.id}')"></button><button class="del" onclick="event.stopPropagation(); askConfirm('Apagar golo?', ()=>deleteGoal('${m.id}', '${g.id}'))">✕</button></span>` : ''}
     </div>`;
  };
  const cardRow = (c) => `<div class="goal-row"><span>${c.minute!=null?`<span class="mono" style="color:var(--gold);">${window.getGlobalMinuteDisplay(m, c.half, c.minute)}'</span>`:''}${c.color==='Amarelo'?'🟨':''} ${playerName(c.playerId)}</span>${!isLocked ?`<span><button class="del" style="color:var(--muted); margin-right:2px;" onclick="event.stopPropagation(); editEventMinute('${m.id}','card','${c.id}')">✎</button><button class="del" onclick="event.stopPropagation(); askConfirm('Apagar cartão?', ()=>deleteCard('${m.id}', '${c.id}'))">✕</button></span>`: ''}</div>`;
  const subRow = (s) => `<div class="goal-row"><span><span class="mono" style="color:var(--gold);">${s.isHalftime ? 'INT' : (s.minute!=null?window.getGlobalMinuteDisplay(m, s.data.half, s.minute)+"'":"")}</span> 🔄 <span style="color:var(--red)">↓ ${playerName(s.data.outId)}</span> <span style="color:var(--green)">↑ ${playerName(s.data.inId)}</span></span>${!isLocked ?`<span>${!s.isHalftime ? `<button class="del" style="color:var(--muted); margin-right:2px;" onclick="event.stopPropagation(); editEventMinute('${m.id}','sub','${s.data.id}')"></button>` : ''}<button class="del" onclick="event.stopPropagation(); askConfirm('Apagar substituição?', ()=>deleteSub('${m.id}', '${s.data.id}'))">✕</button></span>`: ''}</div>`;
  let rows = ''; const h1 = eventsForHalf(1); const h2 = eventsForHalf(2); const h1_regular = h1.filter(e => !e.isHalftime); const h1_int = h1.filter(e => e.isHalftime);
  let h1TimeLabel = (!m.ignoreMinutes && m.timer && m.timer.half1DurationMs != null && !m.manualMode && !m.isNewManualModel) ? formatExactHalf(m.timer.half1DurationMs) : '';
  let h2TimeLabel = (!m.ignoreMinutes && m.timer && m.timer.half2DurationMs != null && !m.manualMode && !m.isNewManualModel) ? formatExactHalf(m.timer.half2DurationMs) : '';
  if(h1.length || tm.kickoff) { rows += `<div style="font-size:11px; color:var(--gold); font-family:-apple-system, sans-serif; text-transform:uppercase; margin:8px 0 4px; font-weight:600; display:flex; justify-content:space-between;"><span>️ 1ª Parte</span><span style="color:var(--muted);">${h1TimeLabel}</span></div>`; rows += h1_regular.map(e => e.type==='goal'?goalRow(e.data):(e.type==='card'?cardRow(e.data):subRow(e))).join(''); }
  if(tm.halftime || h1_int.length > 0) { rows += `<div style="font-size:11px; color:var(--muted); font-family:-apple-system, sans-serif; text-transform:uppercase; margin:12px 0 8px; font-weight:600; text-align:center; border-top:1px dashed var(--line); border-bottom:1px dashed var(--line); padding:6px 0;">⏸️ Intervalo</div>`; rows += h1_int.map(e => e.type==='goal'?goalRow(e.data):(e.type==='card'?cardRow(e.data):subRow(e))).join(''); }
  if(h2.length || tm.secondHalfStart) { rows += `<div style="font-size:11px; color:var(--gold); font-family:-apple-system, sans-serif; text-transform:uppercase; margin:14px 0 4px; font-weight:600; display:flex; justify-content:space-between;"><span>⏱️ 2ª Parte</span><span style="color:var(--muted);">${h2TimeLabel}</span></div>`; rows += h2.map(e => e.type==='goal'?goalRow(e.data):(e.type==='card'?cardRow(e.data):subRow(e))).join(''); }
  return rows || `<div class="empty">Sem registos</div>`;
};

// ==========================================
// EXPORTAÇÕES, BACKUPS, RESET E CRÉDITOS
// ==========================================

window.exportDataJSON = function(){
  state.lastBackupDate = Date.now();
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coachfolio-gkpro-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  saveState();
  if (typeof render === 'function') render();
  if (typeof showToast === 'function') showToast('Backup exportado ✓');
};

function sanitizeData(obj) {
  if (typeof obj === 'string') return obj.trim();
  if (Array.isArray(obj)) return obj.map(sanitizeData);
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (let k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) { sanitized[k] = sanitizeData(obj[k]); } }
    return sanitized;
  }
  return obj;
}

window.validateBackupFile = function(data) {
  if (!data || typeof data !== 'object') throw new Error("Ficheiro não é um objeto válido.");
  const arraysObrigatorios = ['gkRoster', 'gkMatches', 'trainings', 'tactics', 'tacticalNotebook'];
  arraysObrigatorios.forEach(key => {
      if (data[key] !== undefined && !Array.isArray(data[key])) {
          throw new Error(`Estrutura corrompida na secção: ${key}`);
      }
  });
  return true;
};

window.importData = function(input) {
  const file = input.files ? input.files[0] : null;
  if(!file) return;
  if (typeof showToast === 'function') showToast('A ler ficheiro de backup... ⏳');
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const p = JSON.parse(e.target.result);
      if (typeof window.validateBackupFile === 'function') { window.validateBackupFile(p); }
      state = sanitizeData(p); 
      
      if(!state.gkRoster) state.gkRoster = []; 
      if(!state.gkMatches) state.gkMatches = []; 
      if(!state.trainings) state.trainings = []; 
      if(!state.tactics) state.tactics = []; 
      if(!state.tacticPaths) state.tacticPaths = []; 
      if(!state.tacticalNotebook) state.tacticalNotebook = []; 
      if(!state.videos) state.videos = [];
      
      if(!state.teamColor) state.teamColor = '#D9A441'; 
      if(!state.oppColor) state.oppColor = '#C8493F'; 
      if(!state.seasonFormat) state.seasonFormat = 'europeu'; 
      if(!state.currentSeason) state.currentSeason = '26/27'; 
      if(state.isActivated===undefined) state.isActivated=true;
      
      state.lastBackupDate = Date.now(); 
      saveState(); 
      closeModal();
      if (typeof render === 'function') render(); 
      if (typeof showToast === 'function') showToast('✅ Backup restaurado com sucesso!'); 
    } catch(err) { 
      console.error("Erro na importação:", err);
      alert('Erro ao carregar o ficheiro JSON. Verifica se o ficheiro é um backup válido da CoachFolio GK Pro.');
    } 
  };
  reader.readAsText(file);
  input.value = '';
};

window.wipeAllData = function() {
    if (confirm("⚠️ ATENÇÃO! Vais apagar TODOS os dados da aplicação (Guarda-Redes, Jogos, Treinos, Táticas, Vídeos, etc).\n\nEsta ação é irreversível! Tens a certeza absoluta?")) {
        
        const isAppActivated = state.isActivated;
        
        state = { 
            schemaVersion: 1, 
            isActivated: isAppActivated, 
            gkRoster: [], gkMatches: [], trainings: [], tacticalNotebook: [], tactics: [], tacticPaths: [], videos: [],
            tacticFormat: 11, lastBackupDate: null, theme: 'original', lang: 'pt', myClubName: '', escalao: '', clubLogo: null,
            teamColor: '#D9A441', oppColor: '#C8493F', currentSeason: new Date().getFullYear().toString(), seasonFormat: 'civil',
            tacticHalfPitch: false, gameMode: 'futsal', defaultHalfDuration: 20, keepScreenAwake: false, enableVoice: false
        };
        
        saveState();
        closeModal();
        if (typeof navigate === 'function') navigate('home');
        if (typeof render === 'function') render();
        if (typeof showToast === 'function') showToast("🗑️ Todos os dados foram apagados.");
    }
};

window.abrirCreditos = function() {
    window.modalConfig = { type: 'creditos' };
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = renderModalHTML();
};

window.updateExerciseSearch = function(val) {
  window.exerciseSearchQuery = val;
  const listEl = document.getElementById('exercise-list');
  if (listEl) {
    const exercises = (state.tacticalNotebook || []).filter(x => x.category === 'treino');
    const query = (val || '').trim().toLowerCase();
    const filtered = exercises.filter(ex => !query || ex.name.toLowerCase().includes(query));
    listEl.innerHTML = filtered.length > 0 ? filtered.map(ex => `<div style="background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;"> <div> <div style="font-weight:bold; color:var(--chalk); font-size:13px;">${ex.name}</div> <div style="font-size:10px; color:var(--muted);">${ex.halfPitch ? 'Meio Campo' : 'Campo Inteiro'}</div> </div> <button class="btn btn-green" style="flex:none; width:auto; font-size:9px; padding:4px 8px;" onclick="addExerciseToTraining('${ex.id}', 15)">Importar</button> </div>`).join('') : `<div class="empty">Nenhum exercício encontrado.</div>`;
  } else {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = renderModalHTML();
  }
};