// ==========================================
// COACHFOLIO GK PRO — Módulo Equipa & GR
// Plantel exclusivo de Guarda-Redes (Com Histórico)
// ==========================================

window.equipaSubTab = window.equipaSubTab || 'plantel';
window.expandedGK = window.expandedGK || null;
window.editingGKId = window.editingGKId || null;
window.expandedGKSkill = window.expandedGKSkill || null; // Controlo do Histórico
window.compareGK1 = window.compareGK1 || null;
window.compareGK2 = window.compareGK2 || null;

// Atributos específicos de GR (1-5)
const gkAttributes = [
  { id: 'positioning', label: 'Posicionamento', icon: '🎯' }, 
  { id: 'aerial', label: 'Jogo Aéreo', icon: '✈️' },
  { id: 'oneOnOne', label: 'Saídas 1x1', icon: '🚀' },
  { id: 'distribution', label: 'Reposições', icon: '🦶' },
  { id: 'communication', label: 'Comunicação', icon: '🗣️' },
  { id: 'footwork', label: 'Jogo com os Pés', icon: '👟' }
];

// ==========================================
// RENDER PRINCIPAL — ABA EQUIPA
// ==========================================
window.renderEquipa = function() {
  const gkRoster = (state.gkRoster || []).filter(gk => gk.active !== false);
  
  let html = `<div class="topbar"><h1 style="font-size:18px;">EQUIPA & GR</h1></div>`;
  
  html += `<div class="seg" style="margin:10px 16px;">
  <div class="seg-btn ${window.equipaSubTab==='plantel'?'active':''}" onclick="window.equipaSubTab='plantel'; render();"> Plantel (${gkRoster.length})</div>
  <div class="seg-btn ${window.equipaSubTab==='comparar'?'active':''}" onclick="window.equipaSubTab='comparar'; render();">⚖️ Comparar</div>
  <div class="seg-btn ${window.equipaSubTab==='avaliacao'?'active':''}" onclick="window.equipaSubTab='avaliacao'; render();">📊 Avaliação GR</div>
</div>`;

if (window.equipaSubTab === 'plantel') {
  html += renderGKPlantel(gkRoster);
} else if (window.equipaSubTab === 'comparar') {
  html += renderGKCompare(gkRoster);
} else if (window.equipaSubTab === 'avaliacao') {
  if (typeof window.renderGRModule === 'function') {
    html += window.renderGRModule();
  } else {
    html += `<div class="empty">🚧 Módulo de Avaliação ainda não carregado.<br>Verifica se o modulo_gr.js está incluído.</div>`;
  }
}
  
  return html;
};

// ==========================================
// RENDER PLANTEL
// ==========================================
function renderGKPlantel(gkRoster) {
  if (gkRoster.length === 0) {
    return `
      <div class="empty">
        🧤 Nenhum Guarda-Redes no plantel.<br>
        Adiciona o teu primeiro GR abaixo.
      </div>
      <div class="add-row" style="margin:0 16px;">
        <input id="new-gk-input" type="text" placeholder="Nome do Guarda-Redes">
        <button class="btn btn-gold" onclick="window.addGK()">+</button>
      </div>
    `;
  }
  
  let html = `<div style="padding:0 16px;">`;
  
  gkRoster.forEach(gk => {
    const isExpanded = window.expandedGK === gk.id;
    const isEditing = window.editingGKId === gk.id;
    
    // Estatísticas rápidas
    const matchCount = (state.gkMatches || []).filter(m => 
      m.gkStats && m.gkStats[gk.id]
    ).length;
    
    const avgScore = calculateGKAvgScore(gk.id);
    const scoreColor = avgScore >= 70 ? 'var(--green)' : (avgScore >= 40 ? 'var(--yellow)' : 'var(--red)');
    
    html += `
      <div class="card" style="margin-bottom:10px; cursor:pointer;" onclick="window.expandedGK = window.expandedGK === '${gk.id}' ? null : '${gk.id}'; window.editingGKId = null; render();">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:50px; height:50px; background:var(--gold-dim); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px;">
              🧤
            </div>
            <div>
              <div style="font-size:16px; font-weight:bold; color:var(--chalk);">
                ${gk.number ? `Nº${gk.number} - ` : ''}${escapeHTML(gk.name)}
              </div>
              <div style="font-size:11px; color:var(--muted); margin-top:2px;">
                ${gk.foot || 'Destro'} ${gk.height ? `• ${gk.height}cm` : ''} ${gk.weight ? `• ${gk.weight}kg` : ''}
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px; font-weight:bold; color:${scoreColor};">
              ${avgScore > 0 ? avgScore + '%' : '-'}
            </div>
            <div style="font-size:10px; color:var(--muted);">
              ${matchCount} jogo${matchCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Conteúdo expandido
    if (isExpanded && !isEditing) {
      html += renderGKProfile(gk);
    }
    
    // Modo edição
    if (isEditing) {
      html += renderGKEditForm(gk);
    }
  });
  
  html += `
    <div class="add-row" style="margin-top:12px;">
      <input id="new-gk-input" type="text" placeholder="Nome do Guarda-Redes">
      <button class="btn btn-gold" onclick="window.addGK()">+</button>
    </div>
  </div>`;
  
  return html;
}

// ==========================================
// PERFIL DO GR (EXPANDIDO - COM HISTÓRICO)
// ==========================================
function renderGKProfile(gk) {
  // Garantir retrocompatibilidade de dados para quem não tinha Histórico
  if (!gk.skillsHistory) {
      gk.skillsHistory = [{ id: uid(), date: new Date().toISOString().slice(0,10), skills: gk.skills || {} }];
  }
  
  const currentEval = gk.skillsHistory[gk.skillsHistory.length - 1];
  const currentSkills = currentEval.skills || {};
  const measurements = gk.measurements || [];
  const lastMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  let html = `
    <div class="card" style="margin:0 16px 10px 16px; background:var(--surface-2);"> 
      <!-- ATRIBUTOS TÉCNICOS ATUAIS --> 
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3 style="color:var(--gold); font-size:13px; margin:0; text-transform:uppercase;">⭐ Avaliação Atual</h3>
          <span style="font-size:10px; color:var(--muted); font-weight:bold;">${currentEval.date.split('-').reverse().join('/')}</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;"> 
        ${gkAttributes.map(attr => { 
          const val = currentSkills[attr.id] || 3; 
          return `
            <div style="background:var(--surface); padding:8px; border-radius:6px; text-align:center;">
              <div style="font-size:18px; margin-bottom:4px;">${attr.icon}</div>
              <div style="font-size:9px; color:var(--muted); text-transform:uppercase; margin-bottom:4px;">${attr.label}</div>
              <div style="font-size:14px; color:var(--gold); font-weight:bold;">
                ${'★'.repeat(val)}${'☆'.repeat(5-val)}
              </div>
            </div>
          `;
        }).join('')}
      </div>
  `;

  // HISTÓRICO DE AVALIAÇÕES (SÓ MOSTRA SE HOUVER MAIS DO QUE 1)
  if (gk.skillsHistory.length > 1) {
      const pastEvals = [...gk.skillsHistory].reverse().slice(1); // Exclui a atual (já mostrada em cima)
      html += `
        <h4 style="color:var(--gold); font-size:12px; margin:0 0 10px 0; text-transform:uppercase;">📈 Histórico de Evolução</h4>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:16px;">
          ${pastEvals.map(ev => {
             const isOpen = window.expandedGKSkill === ev.id;
             return `
               <div style="background:var(--surface); border:1px solid var(--line); border-radius:6px; overflow:hidden;">
                 <div style="padding:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.expandedGKSkill = window.expandedGKSkill === '${ev.id}' ? null : '${ev.id}'; render();">
                   <span style="font-size:12px; color:var(--chalk); font-weight:bold;">📅 ${ev.date.split('-').reverse().join('/')}</span>
                   <span style="font-size:12px; color:var(--gold);">${isOpen ? '▼' : '▶'}</span>
                 </div>
                 ${isOpen ? `
                 <div style="padding:10px; border-top:1px solid var(--line); display:grid; grid-template-columns:1fr 1fr; gap:8px; background:var(--surface-2);">
                   ${gkAttributes.map(attr => `
                     <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
                       <span style="color:var(--muted);">${attr.icon}${attr.label}</span>
                       <span style="color:var(--gold); font-weight:bold;">${ev.skills[attr.id] || 3} ★</span>
                     </div>
                   `).join('')}
                 </div>
                 ` : ''}
               </div>
             `;
          }).join('')}
        </div>
      `;
  }

  // BIOMETRIA
  html += `
      <h3 style="color:var(--gold); font-size:13px; margin:0 0 10px 0; text-transform:uppercase;">📏 Biometria</h3>
      ${lastMeasurement ? `
        <div style="background:var(--surface); padding:10px; border-radius:6px; margin-bottom:16px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:var(--muted);">Última medição:</span>
            <span style="color:var(--chalk);">${lastMeasurement.date.split('-').reverse().join('/')}</span>
          </div>
          <div style="display:flex; justify-content:space-around; text-align:center;">
            <div>
              <div style="font-size:18px; font-weight:bold; color:var(--gold);">${lastMeasurement.height}cm</div>
              <div style="font-size:9px; color:var(--muted);">ALTURA</div>
            </div>
            <div>
              <div style="font-size:18px; font-weight:bold; color:var(--gold);">${lastMeasurement.weight}kg</div>
              <div style="font-size:9px; color:var(--muted);">PESO</div>
            </div>
            ${(() => {
              const hM = lastMeasurement.height / 100;
              const imc = (lastMeasurement.weight / (hM * hM)).toFixed(1);
              return `
                <div>
                  <div style="font-size:18px; font-weight:bold; color:var(--gold);">${imc}</div>
                  <div style="font-size:9px; color:var(--muted);">IMC</div>
                </div>
              `;
            })()}
          </div>
        </div>
      ` : `
        <div style="background:var(--surface); padding:10px; border-radius:6px; margin-bottom:16px; font-size:11px; color:var(--muted); text-align:center;">
          Sem medições registadas
        </div>
      `}

      <!-- BOTÕES DE AÇÃO -->
      <div style="display:flex; gap:8px;">
        <button class="btn btn-outline" style="flex:1; font-size:11px;" onclick="window.editingGKId='${gk.id}'; render();">
          ✏️ Editar Perfil
        </button>
        <button class="btn btn-gold" style="flex:1; font-size:11px;" onclick="window.exportGKPDF('${gk.id}')">
          📄 Exportar PDF
        </button>
      </div>
    </div>
  `;
  return html;
}

// ==========================================
// FORMULÁRIO DE EDIÇÃO
// ==========================================
function renderGKEditForm(gk) {
  // Usa o valor atual, ou da última gravação de histórico
  const skills = (gk.skillsHistory && gk.skillsHistory.length > 0) 
                 ? gk.skillsHistory[gk.skillsHistory.length - 1].skills 
                 : (gk.skills || {});
  const measurements = gk.measurements || [];
  
  return `
  <div class="card" style="margin:0 16px 10px 16px; background:var(--surface-2); border:1px solid var(--gold);">
    <h3 style="color:var(--gold); font-size:14px; margin:0 0 12px 0; text-transform:uppercase;">✏️ Editar Guarda-Redes</h3>
    
    <!-- DADOS BÁSICOS -->
    <div class="field">
      <label>Nome</label>
      <input type="text" id="gk-edit-name" value="${escapeHTML(gk.name)}" style="width:100%; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
      <div class="field" style="margin-bottom:0;">
        <label>Número</label>
        <input type="number" id="gk-edit-number" value="${gk.number || ''}" style="width:100%; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
      </div>
      <div class="field" style="margin-bottom:0;">
        <label>Pé Dominante</label>
        <select id="gk-edit-foot" style="width:100%; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
          <option value="Destro" ${gk.foot === 'Destro' ? 'selected' : ''}>Destro</option>
          <option value="Esquerdino" ${gk.foot === 'Esquerdino' ? 'selected' : ''}>Esquerdino</option>
          <option value="Ambidestro" ${gk.foot === 'Ambidestro' ? 'selected' : ''}>Ambidestro</option>
        </select>
      </div>
    </div>

    <!-- ATRIBUTOS TÉCNICOS (Atualizado para o Histórico) -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin:16px 0 10px 0;">
        <h4 style="color:var(--gold); font-size:12px; margin:0; text-transform:uppercase;">⭐ Atributos Técnicos (1-5)</h4>
    </div>
    <div style="font-size:9px; color:var(--muted); margin-bottom:10px;">💡 Ao guardar, será criada uma avaliação com a data de hoje no perfil.</div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;">
      ${gkAttributes.map(attr => `
        <div class="field" style="margin-bottom:0;">
          <label>${attr.icon}${attr.label}</label>
          <select id="gk-skill-${attr.id}" style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:6px; font-size:12px; box-sizing:border-box;">
            ${[1,2,3,4,5].map(v => `<option value="${v}" ${skills[attr.id] === v ? 'selected' : ''}>${v} ★</option>`).join('')}
          </select>
        </div>
      `).join('')}
    </div>

    <!-- MEDIÇÕES (Mantidas para controlo físico/IMC) -->
    <div style="background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:12px; margin:16px 0;">
      <h4 style="color:var(--gold); font-size:12px; margin:0 0 10px 0; text-transform:uppercase; display:flex; align-items:center; gap:6px;">
        📏 Medições Físicas
      </h4>
      ${measurements.length > 0 ? 
        `<div style="max-height:150px; overflow-y:auto; margin-bottom:12px;"> 
          ${measurements.slice().reverse().map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:8px 10px; border-radius:6px; margin-bottom:6px; font-size:11px;">
              <span style="color:var(--muted);">📅 ${m.date.split('-').reverse().join('/')}</span>
              <span style="color:var(--chalk); font-weight:bold;">${m.height}cm | ${m.weight}kg</span>
              <button style="background:none; border:none; color:var(--red); cursor:pointer; font-size:14px;" onclick="window.deleteGKMeasurement('${gk.id}', '${m.id}')">✕</button>
            </div>
          `).join('')} 
        </div>` 
        : '<div style="font-size:11px; color:var(--muted); margin-bottom:12px; text-align:center;">Sem medições registadas</div>'
      }
      
      <div style="border-top:1px solid var(--line); padding-top:12px;">
        <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-bottom:8px; font-weight:bold;">Nova Medição</div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:10px;">
          <input type="date" id="gk-med-date" value="${new Date().toISOString().slice(0,10)}" style="width:100%; min-width:0; padding:6px 4px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:6px; font-size:10px; box-sizing:border-box;">
          <input type="number" id="gk-med-height" placeholder="Alt (cm)" style="width:100%; min-width:0; padding:6px 4px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:6px; font-size:10px; box-sizing:border-box;">
          <input type="number" id="gk-med-weight" placeholder="Peso (kg)" style="width:100%; min-width:0; padding:6px 4px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:6px; font-size:10px; box-sizing:border-box;">
        </div>
        <button class="btn btn-outline" style="width:100%; font-size:11px; padding:10px;" onclick="window.addGKMeasurement('${gk.id}')">
          ➕ Adicionar Medição
        </button>
      </div>
    </div>

    <!-- BOTÕES FINAIS -->
    <div style="display:flex; gap:8px;">
      <button class="btn btn-gold" style="flex:1;" onclick="window.saveGKEdit('${gk.id}')">💾 Guardar Perfil</button>
      <button class="btn btn-outline" style="flex:none; padding:0 16px;" onclick="window.editingGKId=null; render();">✕</button>
      <button class="btn btn-danger" style="flex:none; padding:0 16px;" onclick="window.deleteGK('${gk.id}')">🗑️</button>
    </div>
  </div>`;
}

// ==========================================
// RENDER COMPARAR (ATUALIZADO: 1 GR = Dados, 2 GRs = Comparação)
// ==========================================
function renderGKCompare(gkRoster) {
  // Inicializa seleções se não existirem
  if (!window.compareGK1 && gkRoster.length > 0) window.compareGK1 = gkRoster[0].id;
  if (!window.compareGK2 && gkRoster.length > 1) window.compareGK2 = gkRoster[1].id;

  const gk1 = gkRoster.find(g => g.id === window.compareGK1) || gkRoster[0];
  const gk2 = gkRoster.find(g => g.id === window.compareGK2);
  
  // Se só temos 1 GR, mostra apenas os dados dele
  if (gkRoster.length === 1 || !gk2) {
    const gk = gk1;
    const stats = calculateGKFullStats(gk.id);
    const gkSkills = (gk.skillsHistory && gk.skillsHistory.length > 0) ? gk.skillsHistory[gk.skillsHistory.length - 1].skills : (gk.skills || {});
    
    let html = `<div style="padding:0 16px;">`;
    
    // Card de Estatísticas Individuais
    html += `
      <div class="card">
        <h3 style="color:var(--gold); font-size:13px; margin:0 0 12px 0; text-transform:uppercase;">📊 Estatísticas de ${escapeHTML(gk.name)}</h3>
        ${renderCompareRow('Jogos', stats.matches, '-', false)}
        ${renderCompareRow('Minutos', stats.minutes + "'", "-", false)}
        ${renderCompareRow('Golos Sofridos', stats.goalsConceded, "-", true)}
        ${renderCompareRow('Defesas', stats.saves, "-", false)}
        ${renderCompareRow('Média Score', stats.avgScore + '%', "-", false)}
      </div>
      
      <!-- Atributos Técnicos Individuais -->
      <div class="card" style="margin-top:12px;">
        <h3 style="color:var(--gold); font-size:13px; margin:0 0 12px 0; text-transform:uppercase;">⭐ Atributos Técnicos</h3>
        ${gkAttributes.map(attr => {
          const val = gkSkills[attr.id] || 3;
          return `
            <div style="margin-bottom:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11px; color:var(--chalk); font-weight:bold;">
                  ${val}${'★'.repeat(val)}
                </span>
                <span style="font-size:10px; color:var(--muted); text-transform:uppercase;">
                  ${attr.icon}${attr.label}
                </span>
                <span style="width:40px;"></span> <!-- Espaço vazio para alinhar com VS -->
              </div>
              <div style="display:flex; gap:4px;">
                <div style="flex:${val}; background:var(--green); height:6px; border-radius:3px;"></div>
                <div style="flex:${5-val}; background:var(--surface-2); height:6px; border-radius:3px;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    
    html += `</div>`;
    return html;
  }

  // SE TIVERMOS 2 GRs, MANTÉM A COMPARAÇÃO LADO A LADO ORIGINAL
  const stats1 = calculateGKFullStats(gk1.id);
  const stats2 = calculateGKFullStats(gk2.id);
  const gkSkills1 = (gk1.skillsHistory && gk1.skillsHistory.length > 0) ? gk1.skillsHistory[gk1.skillsHistory.length - 1].skills : (gk1.skills || {});
  const gkSkills2 = (gk2.skillsHistory && gk2.skillsHistory.length > 0) ? gk2.skillsHistory[gk2.skillsHistory.length - 1].skills : (gk2.skills || {});

  let html = `<div style="padding:0 16px;">`;
  
  // Seletores
  html +=  `<div style="display:flex; gap:10px; margin-bottom:16px;"> 
    <select id="compare-gk1" onchange="window.compareGK1=this.value; render();" style="flex:1; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px;"> 
      ${gkRoster.map(gk =>` <option value= "${gk.id} " ${gk.id === gk1.id ? 'selected' : ''} >${gk.name} </option > `).join('')} 
    </select> 
    <div style="display:flex; align-items:center; color:var(--gold); font-weight:bold;">VS</div> 
    <select id="compare-gk2" onchange="window.compareGK2=this.value; render();" style="flex:1; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px;"> 
      ${gkRoster.map(gk =>` <option value= "${gk.id} " ${gk.id === gk2.id ? 'selected' : ''} >${gk.name} </option > `).join('')} 
    </select> 
  </div>` ;
  
  // Comparação de atributos
  html += `
  <div class="card">
  <h3 style="color:var(--gold); font-size:13px; margin:0 0 12px 0; text-transform:uppercase;">⭐ Atributos Técnicos</h3>
  ${gkAttributes.map(attr => {
  const val1 = gkSkills1[attr.id] || 3;
  const val2 = gkSkills2[attr.id] || 3;
  const better = val1 > val2 ? 1 : (val2 > val1 ? 2 : 0);
      return `
         <div style="margin-bottom:10px;">
           <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
             <span style="font-size:11px; color:${better === 1 ? 'var(--green)' : 'var(--chalk)'}; font-weight:bold;">
               ${val1}${'★'.repeat(val1)}
             </span>
             <span style="font-size:10px; color:var(--muted); text-transform:uppercase;">
               ${attr.icon}${attr.label}
             </span>
             <span style="font-size:11px; color:${better === 2 ? 'var(--green)' : 'var(--chalk)'}; font-weight:bold;">
               ${'★'.repeat(val2)}${val2}
             </span>
           </div>
           <div style="display:flex; gap:4px;">
             <div style="flex:${val1}; background:var(--green); height:6px; border-radius:3px;"></div>
             <div style="flex:${5-val1}; background:var(--surface-2); height:6px; border-radius:3px;"></div>
             <div style="flex:${val2}; background:var(--green); height:6px; border-radius:3px;"></div>
             <div style="flex:${5-val2}; background:var(--surface-2); height:6px; border-radius:3px;"></div>
           </div>
         </div>
       `;
     }).join('')}
   </div>
  `;
  
  // Comparação de estatísticas de jogo
  html += `<div class="card"> <h3 style="color:var(--gold); font-size:13px; margin:0 0 12px 0; text-transform:uppercase;">📊 Estatísticas de Jogo</h3> ${renderCompareRow('Jogos', stats1.matches, stats2.matches)} ${renderCompareRow('Minutos', stats1.minutes + "'", stats2.minutes + "'")} ${renderCompareRow('Golos Sofridos', stats1.goalsConceded, stats2.goalsConceded, true)} ${renderCompareRow('Defesas', stats1.saves, stats2.saves)} ${renderCompareRow('Média Score', stats1.avgScore + '%', stats2.avgScore + '%')} </div>`;
  html += `</div>`;
  return html;
}

function renderCompareRow(label, val1, val2, invert = false) {
  const num1 = parseFloat(val1) || 0;
  const num2 = parseFloat(val2) || 0;
  const better = num1 > num2 ? 1 : (num2 > num1 ? 2 : 0);
  const color1 = better === 1 ? (invert ? 'var(--red)' : 'var(--green)') : 'var(--chalk)';
  const color2 = better === 2 ? (invert ? 'var(--red)' : 'var(--green)') : 'var(--chalk)';
  
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--line);">
      <span style="flex:1; text-align:center; color:${color1}; font-weight:bold; font-size:14px;">${val1}</span>
      <span style="flex:1.5; text-align:center; font-size:10px; color:var(--muted); text-transform:uppercase;">${label}</span>
      <span style="flex:1; text-align:center; color:${color2}; font-weight:bold; font-size:14px;">${val2}</span>
    </div>
  `;
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function calculateGKAvgScore(gkId) {
  const matches = (state.gkMatches || []).filter(m => 
    m.gkStats && m.gkStats[gkId]
  );
  
  if (matches.length === 0) return 0;
  
  const totalScore = matches.reduce((sum, m) => {
    const stats = m.gkStats[gkId];
    return sum + (stats.score || 0);
  }, 0);
  
  return Math.round(totalScore / matches.length);
}

function calculateGKFullStats(gkId) {
  const matches = (state.gkMatches || []).filter(m => m.gkStats && m.gkStats[gkId]);
  let totalMinutes = 0; let totalGoalsConceded = 0; let totalSaves = 0; let totalScore = 0; let totalGoalsScored = 0;

  matches.forEach(m => {
    const stats = m.gkStats[gkId];
    totalMinutes += stats.periods.reduce((sum, p) => sum + ((p.end || m.totalDuration) - p.start), 0);
    totalGoalsConceded += stats.goalsConceded || 0;

    const saveActions = ['parede', 'queda', 'barreirista', 'def_alta', '1vs1', 'inferioridades'];
    const saves = saveActions.reduce((total, actionId) => {
      const c = stats.counters?.[actionId] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
      return total + c.error + c.insufficient + c.correct + c.excellent;
    }, 0);
    totalSaves += saves;

    // Soma os golos marcados
    const gs = stats.goalsScored || {};
    totalGoalsScored += (gs['5vs4'] || 0) + (gs['remate-defensivo'] || 0) + (gs['remate-ofensivo'] || 0);

    totalScore += stats.score || 0;
  });

  return {
    matches: matches.length,
    minutes: totalMinutes,
    goalsConceded: totalGoalsConceded,
    saves: totalSaves,
    goalsScored: totalGoalsScored,
    avgScore: matches.length > 0 ? Math.round(totalScore / matches.length) : 0
  };
}

// ==========================================
// AÇÕES E GRAVAÇÕES COM HISTÓRICO
// ==========================================

window.addGK = function() {
  const input = document.getElementById('new-gk-input');
  if (!input || !input.value.trim()) {
    if(typeof showToast==='function') showToast('Introduz o nome do Guarda-Redes!');
    return;
  }
  
  if (!state.gkRoster) state.gkRoster = [];
  
  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultSkills = { positioning: 3, aerial: 3, oneOnOne: 3, distribution: 3, communication: 3, footwork: 3 };
  
  state.gkRoster.push({
    id: uid(),
    name: escapeHTML(input.value.trim()),
    number: null,
    foot: 'Destro',
    active: true,
    skills: defaultSkills,
    skillsHistory: [{ id: uid(), date: dateStr, skills: defaultSkills }],
    measurements: []
  });
  
  saveState();
  render();
  if(typeof showToast==='function') showToast('✅ Guarda-Redes adicionado!');
};

window.saveGKEdit = function(gkId) {
  const gk = state.gkRoster.find(g => g.id === gkId);
  if (!gk) return;
  
  const name = document.getElementById('gk-edit-name').value.trim();
  if (!name) {
    if(typeof showToast==='function') showToast('O nome é obrigatório!');
    return;
  }
  
  gk.name = escapeHTML(name);
  gk.number = parseInt(document.getElementById('gk-edit-number').value) || null;
  gk.foot = document.getElementById('gk-edit-foot').value;
  
  // Ler as novas skills
  const newSkills = {};
  gkAttributes.forEach(attr => {
    newSkills[attr.id] = parseInt(document.getElementById(`gk-skill-${attr.id}`).value) || 3;
  });
  
  // Retrocompatibilidade
  gk.skills = newSkills; 
  
  const dateStr = new Date().toISOString().slice(0, 10);
  if (!gk.skillsHistory) gk.skillsHistory = [];
  
  // Lógica de Histórico: Atualiza o registo se for do próprio dia, senão cria um novo (Arquiva a evolução)
  let todayEval = gk.skillsHistory.find(h => h.date === dateStr);
  if (todayEval) {
      todayEval.skills = newSkills;
  } else {
      gk.skillsHistory.push({ id: uid(), date: dateStr, skills: newSkills });
  }
  
  saveState();
  window.editingGKId = null;
  render();
  if(typeof showToast==='function') showToast('✅ Perfil guardado com registo temporal!');
};

window.deleteGK = function(gkId) {
  if (!confirm('Tens a certeza que queres remover este Guarda-Redes?')) return;
  
  state.gkRoster = state.gkRoster.filter(g => g.id !== gkId);
  saveState();
  window.expandedGK = null;
  window.editingGKId = null;
  render();
  if(typeof showToast==='function') showToast('🗑️ Guarda-Redes removido!');
};

window.addGKMeasurement = function(gkId) {
  const gk = state.gkRoster.find(g => g.id === gkId);
  if (!gk) return;
  
  const date = document.getElementById('gk-med-date').value;
  const height = parseInt(document.getElementById('gk-med-height').value);
  const weight = parseInt(document.getElementById('gk-med-weight').value);
  
  if (!date || !height || !weight) {
    if(typeof showToast==='function') showToast('Preenche todos os campos!');
    return;
  }
  
  if (!gk.measurements) gk.measurements = [];
  gk.measurements.push({ id: uid(), date, height, weight });
  
  saveState();
  render();
  if(typeof showToast==='function') showToast('📏 Medição adicionada!');
};

window.deleteGKMeasurement = function(gkId, medId) {
  const gk = state.gkRoster.find(g => g.id === gkId);
  if (!gk || !gk.measurements) return;
  
  gk.measurements = gk.measurements.filter(m => m.id !== medId);
  saveState();
  render();
  if(typeof showToast==='function') showToast('🗑️ Medição removida!');
};

// Helper
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==========================================
// EXPORTAÇÃO PDF (Lê da avaliação atual)
// ==========================================
window.exportGKPDF = function(gkId) {
  const gk = state.gkRoster.find(g => g.id === gkId);
  if (!gk) {
    if(typeof showToast==='function') showToast('Guarda-Redes não encontrado!');
    return;
  }
  
  const stats = calculateGKFullStats(gkId);
  const currentEval = (gk.skillsHistory && gk.skillsHistory.length > 0) ? gk.skillsHistory[gk.skillsHistory.length - 1].skills : (gk.skills || {});
  const measurements = gk.measurements || [];
  const lastMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const logoHtml = state.clubLogo 
    ? `<img src="${state.clubLogo}" style="height:60px; width:auto; object-fit:contain;">` 
    : `<div style="font-size:50px; opacity:0.3;">🛡️</div>`;

  let html = `
    <div style="padding:20px; font-family:-apple-system, sans-serif; max-width:600px; margin:0 auto; background:#fff;"> 
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #D9A441; padding-bottom:12px; margin-bottom:20px;"> 
        <div> 
          <h1 style="font-size:22px; margin:0; text-transform:uppercase; color:#0E211A; font-weight:800;">FICHA INDIVIDUAL</h1> 
          <div style="font-size:18px; font-weight:bold; margin-top:4px; color:#D9A441;"> 
            🧤 ${gk.number ? `Nº${gk.number} - ` : ''}${escapeHTML(gk.name)} 
          </div> 
          <p style="font-size:11px; color:#8FA79B; margin:4px 0 0 0;"> 
            <b>${state.myClubName || 'Clube'}</b> ${state.escalao ? `| ${state.escalao}` : ''} | Época: <b>${state.currentSeason}</b> 
          </p> 
        </div> 
        ${logoHtml}
      </div> 
      
      <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:12px; margin-bottom:16px;"> 
        <h3 style="font-size:12px; font-weight:bold; margin:0 0 8px 0; border-bottom:2px solid #0E211A; padding-bottom:4px; text-transform:uppercase; color:#0E211A;"> Dados Pessoais</h3> 
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11px;"> 
          <div><b>Pé Dominante:</b> ${gk.foot || 'Destro'}</div> 
          ${lastMeasurement ? ` 
            <div><b>Altura:</b> ${lastMeasurement.height}cm</div> 
            <div><b>Peso:</b> ${lastMeasurement.weight}kg</div> 
            <div><b>IMC:</b> ${(lastMeasurement.weight / Math.pow(lastMeasurement.height/100, 2)).toFixed(1)}</div> 
          ` : ''} 
        </div> 
      </div> 
      
      <h3 style="font-size:12px; font-weight:bold; margin:0 0 8px 0; border-bottom:2px solid #0E211A; padding-bottom:4px; text-transform:uppercase; color:#0E211A;">⭐ Avaliação Atual</h3> 
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:16px;"> 
        ${gkAttributes.map(attr => { 
          const val = currentEval[attr.id] || 3; 
          return ` 
            <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; padding:10px; text-align:center;"> 
              <div style="font-size:20px; margin-bottom:4px;">${attr.icon}</div> 
              <div style="font-size:9px; color:#6B7280; text-transform:uppercase; margin-bottom:4px;">${attr.label}</div> 
              <div style="font-size:14px; font-weight:bold; color:#D9A441;"> 
                ${'★'.repeat(val)}${'☆'.repeat(5-val)} 
              </div> 
            </div> 
          `; 
        }).join('')} 
      </div> 
      
      <h3 style="font-size:12px; font-weight:bold; margin:0 0 8px 0; border-bottom:2px solid #0E211A; padding-bottom:4px; text-transform:uppercase; color:#0E211A;">📊 Resumo Estatístico</h3> 
      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-bottom:16px; text-align:center;"> 
        <div style="background:#F3F4F6; border-radius:6px; padding:10px;"> 
          <div style="font-size:16px; font-weight:bold; color:#0E211A;">${stats.matches}</div> 
          <div style="font-size:8px; color:#6B7280; text-transform:uppercase;">Jogos</div> 
        </div> 
        <div style="background:#F3F4F6; border-radius:6px; padding:10px;"> 
          <div style="font-size:16px; font-weight:bold; color:#0E211A;">${stats.minutes}'</div> 
          <div style="font-size:8px; color:#6B7280; text-transform:uppercase;">Mins</div> 
        </div> 
        <div style="background:#FEF2F2; border-radius:6px; padding:10px;"> 
          <div style="font-size:16px; font-weight:bold; color:#DC2626;">${stats.goalsConceded}</div> 
          <div style="font-size:8px; color:#6B7280; text-transform:uppercase;">Sofridos</div> 
        </div> 
        <div style="background:#F0FDF4; border-radius:6px; padding:10px;"> 
          <div style="font-size:16px; font-weight:bold; color:#16A34A;">${stats.saves}</div> 
          <div style="font-size:8px; color:#6B7280; text-transform:uppercase;">Defesas</div> 
        </div> 
        <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; padding:10px;">
          <div style="font-size:16px; font-weight:bold; color:#0E211A;">${stats.goalsScored} ⚽</div>
          <div style="font-size:8px; color:#6B7280; text-transform:uppercase;">Marcados</div>
        </div> 
      </div> 
      
      <div style="font-size:8px; color:#9CA3AF; margin-top:8px; border-top:1px solid #E5E7EB; padding-top:8px;">
        * A avaliação geral (Score %) é uma média calculada através da ponderação das ações técnicas por jogo: Excelente (3 pontos), Correto (2 pontos), Insuficiente (1 ponto) e Erro (0 pontos).
      </div>

      <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #E5E7EB; padding-top:12px;"> 
        <div style="font-size:9px; color:#9CA3AF;"> 
          CoachFolio GK Pro — Ficha Individual<br> 
          Gerado em ${new Date().toLocaleString('pt-PT')} 
        </div> 
        <div style="text-align:center; width:150px; border-top:1px solid #0E211A; padding-top:4px; font-size:10px; font-weight:bold; color:#0E211A;"> 
          O Treinador de GR 
        </div> 
      </div> 
    </div>
  `;

  const printArea = document.getElementById('print-area');
  if (printArea) {
    document.getElementById('app').style.display = 'none';
    printArea.style.display = 'block';
    printArea.innerHTML = `
      <div id="print-ui-bar" style="position:fixed; top:0; left:0; right:0; background:#0E211A; padding:16px; display:flex; justify-content:space-between; align-items:center; z-index:100000; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <button style="background:transparent; border:1px solid #D9A441; color:#D9A441; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:13px; cursor:pointer;" onclick="fecharFicha()">❌ Fechar</button>
        <button id="btn-export-pdf" style="background:#D9A441; color:#0E211A; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:13px; cursor:pointer;" onclick="partilharFicha('Ficha_Individual_Coachfolio.jpg')">📤 Partilhar / Guardar</button>
      </div>
      <div id="pdf-content" style="padding-top:70px; background:#fff; min-height:100vh;">
        ${html}
      </div>
    `;

    window.fecharFicha = function() {
      printArea.style.display = 'none';
      printArea.innerHTML = '';
      document.getElementById('app').style.display = 'block';
    };

    window.partilharFicha = async function(nome) {
      const btn = document.getElementById('btn-export-pdf');
      const barra = document.getElementById('print-ui-bar');
      btn.innerHTML = '⏳ A gerar...';
      
      barra.style.display = 'none'; 
      
      try {
        const elemento = document.getElementById('pdf-content');
        const canvas = await html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        
        canvas.toBlob(async (blob) => {
          const file = new File([blob], nome, { type: 'image/jpeg' });
          
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Ficha Individual CoachFolio GK',
              text: 'Avaliação do Guarda-Redes'
            });
            window.fecharFicha();
          } else {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg');
            link.download = nome;
            link.click();
            barra.style.display = 'flex';
            btn.innerHTML = '📤 Partilhar / Guardar';
          }
        }, 'image/jpeg', 0.9);
      } catch (err) {
        alert('Erro ao gerar o relatório. Tenta novamente.');
        barra.style.display = 'flex';
        btn.innerHTML = '📤 Partilhar / Guardar';
      }
    };
  }
};