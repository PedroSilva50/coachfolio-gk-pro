// ==========================================
// COACHFOLIO GK PRO — Módulo de Jogo
// ==========================================

let gkMatchSession = null;
if (!window.jogoSubTab) window.jogoSubTab = 'ativo';

const gkMatchCategories = [
  { 
    id: 'defesas', 
    icon: '🤚', 
    label: 'Defesas', 
    actions: [
      { id: 'parede', label: 'Parede' },
      { id: 'queda', label: 'Queda' },
      { id: 'barreirista', label: 'Barreirista' },
      { id: 'def_alta', label: 'Def.Alta' },
      { id: '1vs1', label: '1vs1' },
      { id: 'inferioridades', label: 'Inferioridades' }
    ]
  },
  { 
    id: 'bola', 
    icon: '🦶', 
    label: 'Com Bola', 
    actions: [
      { id: 'reposicao_mao', label: 'Reposição Mão' },
      { id: 'reposicao_pe', label: 'Reposição Pé' }
    ]
  }
];

const gkScale = [
  { id: 'error', label: 'Erro', icon: '❌', color: 'var(--red)', weight: 0 },
  { id: 'insufficient', label: 'Insuficiente', icon: '🟠', color: '#F97316', weight: 1 },
  { id: 'correct', label: 'Correto', icon: '🟡', color: 'var(--yellow)', weight: 2 },
  { id: 'excellent', label: 'Excelente', icon: '✅', color: 'var(--green)', weight: 3 }
];

function calculateTotalSaves(gkStats) {
  if (!gkStats || !gkStats.counters) return 0;
  const saveActions = ['parede', 'queda', 'barreirista', 'def_alta', '1vs1', 'inferioridades'];
  return saveActions.reduce((total, actionId) => {
    const c = gkStats.counters[actionId] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
    return total + c.error + c.insufficient + c.correct + c.excellent;
  }, 0);
}

// ==========================================
// RENDER PRINCIPAL E ABAS (3 Abas)
// ==========================================
window.renderJogo = function() {
  let html = `<div class="topbar"><h1 style="font-size:18px;">DIA DE JOGO</h1></div>`;
  
  html += `
  <div class="seg" style="margin:10px 16px;">
    <div class="seg-btn ${window.jogoSubTab==='ativo'?'active':''}" onclick="window.jogoSubTab='ativo'; render();">⚽ Ativo</div>
    <div class="seg-btn ${window.jogoSubTab==='agendados'?'active':''}" onclick="window.jogoSubTab='agendados'; render();">📅 Agendados</div>
    <div class="seg-btn ${window.jogoSubTab==='historico'?'active':''}" onclick="window.jogoSubTab='historico'; render();">📋 Histórico</div>
  </div>`;
  
  if (window.jogoSubTab === 'ativo') {
    html += renderJogoAtivo();
  } else if (window.jogoSubTab === 'agendados') {
    html += renderJogoAgendados();
  } else {
    html += renderJogoHistorico();
  }
  
  return html;
};

// ==========================================
// 1. ABA: JOGO ATIVO
// ==========================================
function renderJogoAtivo() {
  if (!gkMatchSession) {
    return `
      <div class="empty">
        <div style="font-size:30px; margin-bottom:10px;">⚽</div>
        Nenhum jogo a decorrer neste momento.<br><br>
        Vai à aba <b>📅 Agendados</b> para planeares ou iniciares um jogo.
      </div>
    `;
  }
  if (gkMatchSession.status === 'finished') return renderJogoFinished();
  return renderJogoActive();
}

// ==========================================
// 2. ABA: AGENDADOS E CALENDÁRIO
// ==========================================
window.showSchedForm = window.showSchedForm || false;
window.expandedSchedMatch = window.expandedSchedMatch || null;
window.editingSchedMatch = window.editingSchedMatch || null;

function renderJogoAgendados() {
  const gkRoster = (state.gkRoster || []).filter(p => p.active !== false);
  const upcoming = state.upcomingMatches || [];
  let html = '<div style="padding:0 16px;">';

  // LISTA DE JOGOS AGENDADOS (Compacta e expansível)
  if (upcoming.length > 0) {
    html += `<div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">`;
    upcoming.forEach(m => {
      const isExpanded = window.expandedSchedMatch === m.id;
      const isEditing = window.editingSchedMatch === m.id;

      if (isEditing) {
        // FORMULÁRIO DE EDIÇÃO INLINE
        html += `
          <div class="card" style="margin:0; padding:12px; border:1px solid var(--gold);" onclick="event.stopPropagation();">
            <h3 style="color:var(--gold); margin:0 0 12px 0; font-size:13px;">✏️ Editar Agendamento</h3>
            <div class="field">
              <label>Data</label>
              <input type="date" id="edit-sched-date-${m.id}" value="${m.date}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
            </div>
            <div class="field">
              <label>Adversário</label>
              <input type="text" id="edit-sched-opp-${m.id}" value="${escapeHTML(m.opponent)}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="field">
                <label>Local</label>
                <select id="edit-sched-loc-${m.id}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
                  <option value="casa" ${m.location === 'casa' ? 'selected' : ''}>🏠 Casa</option>
                  <option value="fora" ${m.location === 'fora' ? 'selected' : ''}>✈️ Fora</option>
                </select>
              </div>
              <div class="field">
                <label>Competição</label>
                <select id="edit-sched-comp-${m.id}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
                  <option value="campeonato" ${m.competition === 'campeonato' ? 'selected' : ''}>Campeonato</option>
                  <option value="amigavel" ${m.competition === 'amigavel' ? 'selected' : ''}>Amigável</option>
                  <option value="torneio" ${m.competition === 'torneio' ? 'selected' : ''}>Torneio</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-gold" style="flex:1;" onclick="window.saveScheduledMatch('${m.id}')">💾 Guardar</button>
              <button class="btn btn-outline" style="flex:1;" onclick="window.editingSchedMatch=null; render();">Cancelar</button>
            </div>
          </div>
        `;
      } else {
        // CARD NORMAL COMPACTO
        html += `
          <div class="card" style="margin:0; padding:12px; cursor:pointer; border:1px solid ${isExpanded ? 'var(--gold)' : 'transparent'};" onclick="window.expandedSchedMatch = window.expandedSchedMatch === '${m.id}' ? null : '${m.id}'; window.editingSchedMatch = null; render();">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:bold; color:${isExpanded ? 'var(--gold)' : 'var(--chalk)'}; font-size:14px;">${escapeHTML(m.opponent)}</div>
                <div style="font-size:11px; color:var(--muted); margin-top:2px;">${m.competition} • ${m.location === 'casa' ? '🏠 Casa' : '✈️ Fora'}</div>
              </div>
              <div style="text-align:right;">
                <div style="color:var(--gold); font-size:12px; font-weight:bold;">${m.date.split('-').reverse().join('/')}</div>
                <div style="font-size:10px; color:var(--muted); margin-top:2px;">${isExpanded ? '▼ Ocultar' : '▶ Abrir'}</div>
              </div>
            </div>
        `;
        
        // ZONA EXPANDIDA (INICIAR JOGO E AÇÕES)
        if (isExpanded) {
          html += `
            <div style="border-top:1px solid var(--line); margin-top:12px; padding-top:12px;" onclick="event.stopPropagation();">
              <div class="field">
                <label>Guarda-Redes Titular</label>
                <select id="starter-${m.id}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
                  <option value="">-- Escolher GR --</option>
                  ${gkRoster.map(gk => `<option value="${gk.id}">${gk.number ? gk.number+' - ' : ''}${escapeHTML(gk.name)}</option>`).join('')}
                </select>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-gold" style="flex:2;" onclick="window.startScheduledMatch('${m.id}')">⚽ INICIAR JOGO</button>
                <button class="btn btn-outline" style="flex:1;" onclick="window.editingSchedMatch='${m.id}'; render();">✏️ Editar</button>
                <button class="btn btn-outline" style="flex:1; border-color:var(--red); color:var(--red);" onclick="window.deleteScheduledMatch('${m.id}')">🗑️ Eliminar</button>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }
    });
    html += `</div>`;
  } else {
    html += `<div class="empty" style="margin-top:0;">📅 Nenhum jogo agendado.</div>`;
  }

  // BOTÃO PARA MOSTRAR FORMULÁRIO DE NOVO JOGO
  if (!window.showSchedForm) {
    html += `<button class="btn btn-outline" style="width:100%; margin-bottom:16px;" onclick="window.showSchedForm=true; window.expandedSchedMatch=null; window.editingSchedMatch=null; render();">➕ AGENDAR NOVO JOGO</button>`;
  } else {
    // FORMULÁRIO DE NOVO AGENDAMENTO
    html += `
      <div class="card" style="margin:0 0 16px 0;">
        <h3 style="color:var(--gold); margin:0 0 12px 0; font-size:14px;">➕ Novo Agendamento</h3>
        <div class="field">
          <label>Data do Jogo</label>
          <input type="date" id="gk-date-sched" value="${new Date().toISOString().slice(0,10)}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
        </div>
        <div class="field">
          <label>Adversário</label>
          <input type="text" id="gk-opp-sched" placeholder="Nome do adversário" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="field">
            <label>Local</label>
            <select id="gk-location-sched" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
              <option value="casa">🏠 Casa</option>
              <option value="fora">✈️ Fora</option>
            </select>
          </div>
          <div class="field">
            <label>Competição</label>
            <select id="gk-competition-sched" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
              <option value="campeonato">Campeonato</option>
              <option value="amigavel">Amigável</option>
              <option value="torneio">Torneio</option>
            </select>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-gold" style="flex:2;" onclick="window.scheduleMatch()">📅 GUARDAR</button>
          <button class="btn btn-outline" style="flex:1;" onclick="window.showSchedForm=false; render();">Cancelar</button>
        </div>
      </div>
    `;
  }
  
  html += '</div>';
  return html;
}

window.scheduleMatch = function() {
  const date = document.getElementById('gk-date-sched').value || new Date().toISOString().slice(0,10);
  const opp = document.getElementById('gk-opp-sched').value.trim();
  const location = document.getElementById('gk-location-sched').value;
  const competition = document.getElementById('gk-competition-sched').value;

  if (!opp) { showToast('Introduz o adversário!'); return; }

  if (!state.upcomingMatches) state.upcomingMatches = [];
  state.upcomingMatches.push({ id: uid(), date, opponent: opp, location, competition });
  saveState(); 
  window.showSchedForm = false; // Esconde o form depois de agendar
  render(); 
  showToast('📅 Jogo agendado com sucesso!');
};

window.saveScheduledMatch = function(id) {
  const match = state.upcomingMatches.find(m => m.id === id);
  if (!match) return;
  
  match.date = document.getElementById(`edit-sched-date-${id}`).value || match.date;
  match.opponent = document.getElementById(`edit-sched-opp-${id}`).value.trim() || match.opponent;
  match.location = document.getElementById(`edit-sched-loc-${id}`).value;
  match.competition = document.getElementById(`edit-sched-comp-${id}`).value;

  saveState();
  window.editingSchedMatch = null;
  render();
  showToast('✅ Agendamento atualizado!');
};

window.deleteScheduledMatch = function(id) {
  if (!confirm('Apagar este agendamento?')) return;
  state.upcomingMatches = state.upcomingMatches.filter(m => m.id !== id);
  saveState(); 
  render(); 
  showToast('🗑️ Agendamento removido.');
};

window.startScheduledMatch = function(id) {
  const match = state.upcomingMatches.find(m => m.id === id);
  if (!match) return;
  
  const starterId = document.getElementById(`starter-${id}`).value;
  if (!starterId) { showToast('Escolhe o GR Titular primeiro!'); return; }

  const starter = state.gkRoster.find(p => p.id === starterId);
  if (!starter) return;

  let totalDuration = state.gameMode === 'futsal' ? (state.defaultHalfDuration || 20) * 2 : (state.defaultHalfDuration || 45) * 2;

  gkMatchSession = {
    id: match.id, date: match.date, opponent: match.opponent, location: match.location, competition: match.competition,
    totalDuration: totalDuration, status: 'active', activeGKId: starterId,
    gkStats: { [starterId]: createGKStats(starterId, 0) },
    substitutions: [], cards: []
  };

  // Remove dos agendados
  state.upcomingMatches = state.upcomingMatches.filter(m => m.id !== id);
  saveState(); 
  
  // MAGIA: Muda para a Aba Ativo automaticamente!
  window.jogoSubTab = 'ativo'; 
  render(); 
  showToast(`Jogo iniciado! ${starter.name} na baliza.`);
};

// ==========================================
// LÓGICA DE JOGO ATIVO (CONTADORES E DADOS)
// ==========================================

function createGKStats(playerId, startMinute) {
  const stats = {
    playerId: playerId, periods: [{ start: startMinute, end: null }], goalsConceded: 0, goalsConcededByZone: {},
    saves: 0, faultsCommitted: 0, faultsSuffered: 0, faultsCommittedByZone: { ofensivo: 0, defensivo: 0 },
    faultsSufferedByZone: { ofensivo: 0, defensivo: 0 }, faultsSufferedInArea: 0, penaltyCommitted: 0,
    goalsScored: { '5vs4': 0, 'remate-defensivo': 0, 'remate-ofensivo': 0 },
    leadership: { communication: 0, leadership: 0 }, yellowCards: 0, redCards: 0, counters: {}
  };
  gkMatchCategories.forEach(c => { c.actions.forEach(a => { stats.counters[a.id] = { error: 0, insufficient: 0, correct: 0, excellent: 0 }; }); });
  return stats;
}

function renderJogoActive() {
  const s = gkMatchSession;
  const activeGK = s.activeGKId ? state.gkRoster.find(p => p.id === s.activeGKId) : null;
  const stats = s.activeGKId ? s.gkStats[s.activeGKId] : null;
  
  return `
    <div class="topbar">
      <h1 style="font-size:18px;">⚽ JOGO ATIVO</h1>
      <p style="color:var(--gold); font-size:12px; margin-top:4px;">${escapeHTML(s.opponent)} ${s.location === 'casa' ? '(Casa)' : '(Fora)'}</p>
    </div>
    
    ${!s.activeGKId ? `
    <div class="card" style="background:var(--gold-dim); border:1px solid var(--gold); text-align:center; padding:12px;">
      <div style="font-size:14px; font-weight:bold; color:var(--gold);">🔄 5vs4 ATIVO (Power Play)</div>
      <div style="font-size:11px; color:var(--muted); margin-top:4px;">GR no banco — Avaliação pausada</div>
      <button class="btn btn-gold" style="margin-top:10px; font-size:11px;" onclick="window.gkBackToGoal()">🧤 GR Voltou à Baliza</button>
    </div>
    ` : ''}
    
    <div class="card" style="text-align:center; background:var(--surface-2);">
      <div style="font-size:16px; font-weight:bold; color:var(--chalk);">🧤 ${activeGK ? escapeHTML(activeGK.name) : 'GR'} na baliza</div>
      <div style="font-size:11px; color:var(--muted); margin-top:4px;">${s.location === 'casa' ? '🏠 Casa' : '✈️ Fora'} • ${escapeHTML(s.opponent)}</div>
    </div>
    
    ${s.activeGKId ? `
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:13px;">⚡ Ações Rápidas</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <button class="btn btn-outline" onclick="window.registerGoalConceded()">🥅 Golo Sofrido</button>
        <button class="btn btn-outline" onclick="window.registerFault('committed')">⚠️ Falta Cometida</button>
        <button class="btn btn-outline" onclick="window.registerFault('suffered')">⚠️ Falta Sofrida</button>        
        <button class="btn btn-outline" onclick="window.registerPenalty()">🎯 Penálti</button>
        <button class="btn btn-outline" style="border-color:var(--yellow); color:var(--yellow);" onclick="window.registerYellowCard()">🟨 Amarelo</button>
        <button class="btn btn-outline" style="border-color:var(--red); color:var(--red);" onclick="window.registerRedCard()">🟥 Vermelho</button>
      </div>
    </div>
    
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:13px;">📊 Avaliação GR (Contadores)</h3>
      ${renderGKCountersInline(stats)}
    </div>
    
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:13px;">⚽ Golos Marcados (GR)</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
        <button class="btn btn-outline" style="font-size:10px; padding:6px 4px; display:flex; flex-direction:column; align-items:center;" onclick="window.registerGoalScored('5vs4')">
          <span style="color:var(--muted); margin-bottom:2px;">5vs4</span>
          <b style="font-size:18px; color:var(--chalk);">${stats.goalsScored['5vs4'] || 0}</b>
        </button>
        <button class="btn btn-outline" style="font-size:10px; padding:6px 4px; display:flex; flex-direction:column; align-items:center;" onclick="window.registerGoalScored('remate-defensivo')">
          <span style="color:var(--muted); margin-bottom:2px;">Remate Def.</span>
          <b style="font-size:18px; color:var(--chalk);">${stats.goalsScored['remate-defensivo'] || 0}</b>
        </button>
        <button class="btn btn-outline" style="font-size:10px; padding:6px 4px; display:flex; flex-direction:column; align-items:center;" onclick="window.registerGoalScored('remate-ofensivo')">
          <span style="color:var(--muted); margin-bottom:2px;">Remate Of.</span>
          <b style="font-size:18px; color:var(--chalk);">${stats.goalsScored['remate-ofensivo'] || 0}</b>
        </button>
      </div>
    </div>
    
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:13px;">⭐ Liderança</h3>
      <div class="field">
        <label>Comunicação (1-5)</label>
        <select id="gk-leadership-comm" onchange="window.updateLeadership('communication', this.value)" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
          ${[0,1,2,3,4,5].map(n => `<option value="${n}" ${stats.leadership.communication === n ? 'selected' : ''}>${n} ${n > 0 ? '★'.repeat(n) : ''}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Liderança (1-5)</label>
        <select id="gk-leadership-lead" onchange="window.updateLeadership('leadership', this.value)" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
          ${[0,1,2,3,4,5].map(n => `<option value="${n}" ${stats.leadership.leadership === n ? 'selected' : ''}>${n} ${n > 0 ? '★'.repeat(n) : ''}</option>`).join('')}
        </select>
      </div>
    </div>
    ` : ''}
    
    <div class="card">
      <button class="btn btn-gold" style="width:100%;" onclick="window.openSubModal()">🔄 SUBSTITUIÇÃO GR</button>
    </div>
    
    ${s.activeGKId ? `
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:13px;">📊 Resumo</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
        <div> Golos Sofridos: <b style="color:var(--red);">${stats.goalsConceded}</b></div>
        <div>🧤 Defesas: <b style="color:var(--green);">${calculateTotalSaves(stats)}</b></div>
        <div>⚠️ Faltas Cometidas: <b>${stats.faultsCommitted}</b></div>
        <div>️ Faltas Sofridas: <b>${stats.faultsSuffered}</b></div>
        <div>🎯 Falta na Área: <b>${stats.faultsSufferedInArea}</b></div>
        <div>🎯 Penálti: <b>${stats.penaltyCommitted}</b></div>
        <div>🟨 Amarelos: <b>${stats.yellowCards}</b></div>
        <div>🟥 Vermelhos: <b>${stats.redCards}</b></div>
      </div>
    </div>
    ` : ''}
    
    <div class="card">
      <button class="btn btn-danger" style="width:100%;" onclick="window.finishGKMatch()">🏁 TERMINAR JOGO</button>
    </div>
  `;
}

window.openSubModal = function() {
  const s = gkMatchSession;
  const lastSub = s.substitutions.length > 0 ? s.substitutions[s.substitutions.length - 1] : null;
  const currentMinute = lastSub ? lastSub.minute : 0;
  const activeGK = s.activeGKId ? state.gkRoster.find(p => p.id === s.activeGKId) : null;
  const otherGKs = (state.gkRoster || []).filter(p => p.active !== false && p.id !== s.activeGKId);
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'sub-modal';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  
  modal.innerHTML = `
    <div class="modal-card" style="max-width:400px;">
      <h3 style="color:var(--gold); text-align:center; margin-top:0;">🔄 Substituição GR</h3>
      ${activeGK ? `<div style="background:var(--surface-2); padding:10px; border-radius:8px; margin-bottom:12px; text-align:center;"><div style="font-size:10px; color:var(--muted); text-transform:uppercase;">GR a sair</div><div style="font-size:16px; font-weight:bold; color:var(--chalk);">🧤 ${escapeHTML(activeGK.name)}</div></div>` : ''}
      <div class="field">
        <label>Minuto Atual</label>
        <input type="number" id="sub-minute" value="${currentMinute}" min="0" max="${s.totalDuration}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
      </div>
      <div style="font-size:11px; color:var(--muted); text-transform:uppercase; margin:12px 0 8px 0; font-weight:bold;">Quem entra?</div>
      ${otherGKs.length > 0 ? `<div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">${otherGKs.map(gk => `<button class="btn btn-outline" style="width:100%; text-align:left;" onclick="window.confirmSub('${gk.id}', false)">🧤 ${gk.number ? gk.number + ' - ' : ''}${escapeHTML(gk.name)}</button>`).join('')}</div>` : '<div style="font-size:11px; color:var(--muted); text-align:center; margin-bottom:12px;">Sem outros GR no plantel</div>'}
      <div style="border-top:1px solid var(--line); padding-top:12px; margin-top:12px;">
        <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-bottom:8px; text-align:center;">OU</div>
        <button class="btn btn-outline" style="width:100%; border-color:var(--gold); color:var(--gold);" onclick="window.confirmSub(null, true)">🏃 Jogador de Campo (5vs4)</button>
      </div>
      <button class="btn btn-outline" style="width:100%; margin-top:12px;" onclick="document.getElementById('sub-modal').remove()">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.confirmSub = function(newGKId, is5v4) {
  const subMinuteInput = document.getElementById('sub-minute');
  const subMinute = parseInt(subMinuteInput.value);
  if (isNaN(subMinute) || subMinute < 0) { showToast('Indica o minuto da substituição!'); return; }
  
  const s = gkMatchSession;
  if (subMinute > s.totalDuration) { showToast(`Máximo: ${s.totalDuration}'`); return; }
  
  const outId = s.activeGKId;
  if (outId && s.gkStats[outId]) {
    const lastPeriod = s.gkStats[outId].periods[s.gkStats[outId].periods.length - 1];
    if (lastPeriod.end === null) lastPeriod.end = subMinute;
  }
  
  s.substitutions.push({ minute: subMinute, out: outId, in: is5v4 ? '5v4_field' : newGKId, is5v4: is5v4 });
  
  if (is5v4) {
    s.activeGKId = null;
  } else {
    s.activeGKId = newGKId;
    if (!s.gkStats[newGKId]) s.gkStats[newGKId] = createGKStats(newGKId, subMinute);
    else s.gkStats[newGKId].periods.push({ start: subMinute, end: null });
  }
  document.getElementById('sub-modal').remove();
  render();
};

window.gkBackToGoal = function() {
  const s = gkMatchSession;
  const lastSub = s.substitutions.length > 0 ? s.substitutions[s.substitutions.length - 1] : null;
  const currentMinute = lastSub ? lastSub.minute : 0;
  const gkRoster = (state.gkRoster || []).filter(p => p.active !== false);
  
  if (gkRoster.length === 1) {
    window.confirmBackToGoal(gkRoster[0].id, currentMinute);
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'back-modal';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-card" style="max-width:400px;">
      <h3 style="color:var(--gold); text-align:center; margin-top:0;">🧤 Qual GR volta à baliza?</h3>
      <div class="field">
        <label>Minuto Atual</label>
        <input type="number" id="back-minute" value="${currentMinute}" min="0" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; box-sizing:border-box;">
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:12px;">
        ${gkRoster.map(gk => `<button class="btn btn-outline" style="width:100%; text-align:left;" onclick="window.confirmBackToGoal('${gk.id}', document.getElementById('back-minute').value)">🧤 ${escapeHTML(gk.name)}</button>`).join('')}
      </div>
      <button class="btn btn-outline" style="width:100%; margin-top:12px;" onclick="document.getElementById('back-modal').remove()">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.confirmBackToGoal = function(gkId, minuteStr) {
  const backMinute = parseInt(minuteStr) || 0;
  const s = gkMatchSession;
  s.activeGKId = gkId;
  if (!s.gkStats[gkId]) s.gkStats[gkId] = createGKStats(gkId, backMinute);
  else s.gkStats[gkId].periods.push({ start: backMinute, end: null });
  s.substitutions.push({ minute: backMinute, out: '5v4_field', in: gkId, is5v4: false });
  const m = document.getElementById('back-modal');
  if(m) m.remove();
  render();
};

function renderGKCountersInline(stats) {
  let html = `<div style="display:grid; grid-template-columns: 75px repeat(4, minmax(0, 1fr)); gap:2px; margin-bottom:8px; padding:0 4px; align-items:end;">
    <div style="font-size:9px; color:var(--muted); font-weight:bold; text-transform:uppercase; padding-bottom:4px;">Técnica</div>
    ${gkScale.map(s => `<div style="font-size:9px; color:${s.color}; font-weight:bold; text-align:center; line-height:1.2;">${s.icon}<br>${s.label}</div>`).join('')}
  </div>`;
  
  gkMatchCategories.forEach(cat => {
    const catTotal = cat.actions.reduce((sum, a) => {
      const c = stats.counters[a.id] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
      return sum + c.error + c.insufficient + c.correct + c.excellent;
    }, 0);
    html += `<div style="margin-bottom:8px; border:1px solid var(--line); border-radius:8px; overflow:hidden;">
      <div style="padding:8px 10px; background:var(--surface-2); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; color:var(--gold); font-weight:bold;">${cat.icon} ${cat.label} <span style="color:var(--muted); font-size:10px;">(${catTotal} ações)</span></span>
      </div>
      <div style="padding:4px 8px;">
        ${cat.actions.map(a => { 
          const c = stats.counters[a.id] || { error: 0, insufficient: 0, correct: 0, excellent: 0 }; 
          return renderCounterRowInline(a.id, a.label, c); 
        }).join('')}
      </div>
    </div>`;
  });
  return html;
}

function renderCounterRowInline(actionId, label, counts) {
  return `<div style="display:grid; grid-template-columns: 75px repeat(4, minmax(0, 1fr)); gap:2px; padding:6px 0; border-bottom:1px solid var(--line); align-items:center;">
    <div style="font-size:10px; color:var(--chalk); font-weight:500; word-break:break-word; padding-right:4px; line-height:1.2;">${label}</div>
    ${gkScale.map(s => renderCounterButtonInline(actionId, s.id, s.color, counts[s.id])).join('')}
  </div>`;
}

function renderCounterButtonInline(actionId, type, color, value) {
  return `<div style="display:flex; align-items:center; justify-content:center; gap:2px; background:var(--surface-2); border-radius:4px; padding:2px;">
    <button style="width:20px; height:20px; background:var(--red); color:#fff; border:none; border-radius:3px; font-size:12px; font-weight:bold; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center;" onclick="window.updateGKMatchCounter('${actionId}','${type}',-1)">−</button>
    <span style="min-width:14px; text-align:center; font-size:11px; font-weight:bold; color:${value > 0 ? color : 'var(--muted)'};">${value}</span>
    <button style="width:20px; height:20px; background:var(--green); color:#fff; border:none; border-radius:3px; font-size:12px; font-weight:bold; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center;" onclick="window.updateGKMatchCounter('${actionId}','${type}',1)">+</button>
  </div>`;
}

window.updateGKMatchCounter = function(actionId, type, delta) {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  if (!stats.counters[actionId]) stats.counters[actionId] = { error: 0, insufficient: 0, correct: 0, excellent: 0 };
  stats.counters[actionId][type] = Math.max(0, stats.counters[actionId][type] + delta);
  render();
};

window.registerGoalConceded = function() { window._pendingAction = 'goalConceded'; showGoalZoneModal(); };
window.registerFault = function(type) { window._pendingFaultType = type; showFaultZoneModal(); };

window.registerFaultSufferedInArea = function() {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.faultsSufferedInArea++; stats.faultsSuffered++;
  render(); showToast('🎯 Falta sofrida dentro da área!');
};

window.registerPenalty = function() {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.penaltyCommitted++;
  render(); showToast('🎯 Penálti cometido!');
};

window.registerGoalScored = function(type) {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.goalsScored[type] = (stats.goalsScored[type] || 0) + 1;
  render(); showToast(`⚽ Golo ${type} registado!`);
};

window.updateLeadership = function(attr, value) {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.leadership[attr] = parseInt(value);
};

window.registerYellowCard = function() {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.yellowCards++;
  gkMatchSession.cards.push({ type: 'yellow', playerId: gkMatchSession.activeGKId, minute: 0 });
  render();
  if (stats.yellowCards === 2) showExpulsionToast();
  else showToast('🟨 Cartão amarelo registado!');
};

window.registerRedCard = function() {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.redCards++;
  gkMatchSession.cards.push({ type: 'red', playerId: gkMatchSession.activeGKId, minute: 0 });
  render(); showExpulsionToast();
};

function showExpulsionToast() {
  const activeGK = state.gkRoster.find(p => p.id === gkMatchSession.activeGKId);
  const toast = document.createElement('div');
  toast.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--red); color: white; padding: 16px 24px; border-radius: 12px; font-size: 14px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;
  toast.innerHTML = `<div style="text-align:center;"><div style="font-size:24px; margin-bottom:8px;">🟥</div><div>${escapeHTML(activeGK.name)} está EXPULSO!</div><div style="font-size:11px; font-weight:normal; margin-top:4px;">Faz a substituição</div></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showGoalZoneModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-card" style="max-width:360px;">
      <h3 style="color:var(--gold); text-align:center; margin-top:0;">🥅 Zona do Golo Sofrido</h3>
      <p style="font-size:11px; color:var(--muted); text-align:center; margin-bottom:12px;">Clica na zona onde foi batido o golo</p>
      <div id="goal-zone-svg">${window.renderGoalSVG({}, true, 260)}</div>
      <button class="btn btn-outline" style="width:100%; margin-top:12px;" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ==========================================
// A NOVA BALIZA EM 3D E ANÁLISES (INALTERADO)
// ==========================================
window.renderGoalSVG = function(zones = {}, clickable = false, size = 240) {
  const w = size, h = Math.round(size * 0.6);
  const cellW = w / 3, cellH = h / 3;
  const zoneLabels = [
    ['alto-esquerda', 'alto-centro', 'alto-direita'],
    ['medio-esquerda', 'medio-centro', 'medio-direita'],
    ['baixo-esquerda', 'baixo-centro', 'baixo-direita']
  ];

  const colorPost = '#FFFFFF';
  const colorShadow = '#9CA3AF'; 
  const colorNet = '#9CA3AF';
  const colorHover = 'rgba(217, 164, 65, 0.4)'; 
  const colorLabelBg = 'rgba(14, 33, 26, 0.8)';

  let svg = `<svg viewBox="-15 -15 ${w+30} ${h+30}" style="width:100%; max-width:${w}px; height:auto; display:block; margin:0 auto; overflow:visible; background:transparent;">`;

  svg += `
    <defs>
      <pattern id="netPattern" width="14" height="14" patternUnits="userSpaceOnUse">
        <path d="M 14 0 L 0 14 M 0 0 L 14 14" fill="none" stroke="${colorNet}" stroke-width="0.5" opacity="0.6"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#netPattern)" />
  `;

  for (let i = 1; i < 3; i++) {
    svg += `<line x1="${cellW*i}" y1="0" x2="${cellW*i}" y2="${h}" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>`;
    svg += `<line x1="0" y1="${cellH*i}" x2="${w}" y2="${cellH*i}" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>`;
  }

  svg += `<path d="M 0 ${h} L 0 0 L ${w} 0 L ${w} ${h}" fill="none" stroke="${colorShadow}" stroke-width="10" stroke-linecap="square" stroke-linejoin="miter"/>`;
  svg += `<path d="M 0 ${h} L 0 0 L ${w} 0 L ${w} ${h}" fill="none" stroke="${colorPost}" stroke-width="6" stroke-linecap="square" stroke-linejoin="miter"/>`;

  zoneLabels.forEach((row, ri) => {
    row.forEach((zone, ci) => {
      const cx = cellW * ci + cellW / 2;
      const cy = cellH * ri + cellH / 2;
      const count = zones[zone] || 0;
      
      if (clickable) {
        svg += `<rect x="${cellW*ci}" y="${cellH*ri}" width="${cellW}" height="${cellH}" 
                fill="transparent" stroke="none"
                style="cursor:pointer; transition: fill 0.2s;" 
                onmouseover="this.setAttribute('fill', '${colorHover}')" 
                onmouseout="this.setAttribute('fill', 'transparent')"
                onclick="window.onGoalZoneClick('${zone}')"/>`;
        
        const lbl = zone.split('-')[0].charAt(0).toUpperCase() + zone.split('-')[0].slice(1) + '-' + zone.split('-')[1].charAt(0).toUpperCase();
        svg += `<rect x="${cx - 25}" y="${cy - 9}" width="50" height="18" rx="4" fill="${colorLabelBg}" style="pointer-events:none;"/>`;
        svg += `<text x="${cx}" y="${cy+3}" text-anchor="middle" fill="#F3EFE6" font-size="9" font-weight="bold" style="pointer-events:none;">${lbl}</text>`;
      } else if (count > 0) {
        svg += `<circle cx="${cx}" cy="${cy}" r="15" fill="var(--red)" stroke="#FFFFFF" stroke-width="2"/>`;
        svg += `<text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="bold" style="pointer-events:none;">${count}</text>`;
      }
    });
  });

  svg += `</svg>`;
  return svg;
};

window.onGoalZoneClick = function(zone) {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  stats.goalsConceded++;
  stats.goalsConcededByZone[zone] = (stats.goalsConcededByZone[zone] || 0) + 1;
  document.querySelector('.modal-overlay').remove();
  showToast(`🥅 Golo sofrido: ${zone}!`);
  render();
};

function showFaultZoneModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="modal-card" style="max-width:320px;">
      <h3 style="color:var(--gold); text-align:center; margin-top:0;">⚠️ Zona da Falta</h3>
      <p style="font-size:11px; color:var(--muted); text-align:center; margin-bottom:12px;">
        ${window._pendingFaultType === 'committed' ? 'Falta cometida pelo GR' : 'Falta sofrida pelo GR'}
      </p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <button class="btn btn-outline" onclick="window.confirmFault('ofensivo')">Meio Ofensivo</button>
        <button class="btn btn-outline" onclick="window.confirmFault('defensivo')">Meio Defensivo</button>
      </div>
      <button class="btn btn-outline" style="width:100%; margin-top:12px;" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

window.confirmFault = function(zone) {
  const stats = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  const type = window._pendingFaultType;
  if (type === 'committed') {
    stats.faultsCommitted++;
    stats.faultsCommittedByZone[zone] = (stats.faultsCommittedByZone[zone] || 0) + 1;
  } else {
    stats.faultsSuffered++;
    stats.faultsSufferedByZone[zone] = (stats.faultsSufferedByZone[zone] || 0) + 1;
  }
  document.querySelector('.modal-overlay').remove();
  showToast(`⚠️ Falta registada: ${zone}!`);
  render();
};

window.finishGKMatch = function() {
  if (!confirm('Terminar o jogo? As estatísticas serão guardadas.')) return;
  if (gkMatchSession.activeGKId) {
    const activeGK = gkMatchSession.gkStats[gkMatchSession.activeGKId];
    const lastPeriod = activeGK.periods[activeGK.periods.length - 1];
    if (lastPeriod.end === null) lastPeriod.end = gkMatchSession.totalDuration;
  }
  gkMatchSession.status = 'finished';
  render();
};

function renderJogoFinished() {
  const s = gkMatchSession;
  return `
    <div class="topbar">
      <h1 style="font-size:18px;"> JOGO TERMINADO</h1>
      <p style="color:var(--gold); font-size:12px; margin-top:4px;">${escapeHTML(s.opponent)}</p>
    </div>
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 12px 0; font-size:14px;">📊 Resultado Final</h3>
      <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center; text-align:center;">
        <div>
          <div style="font-size:11px; color:var(--muted);">Nosso</div>
          <input type="number" id="gk-result-us" min="0" value="0" style="width:60px; padding:8px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:20px; text-align:center; box-sizing:border-box;">
        </div>
        <div style="font-size:20px; color:var(--muted);">-</div>
        <div>
          <div style="font-size:11px; color:var(--muted);">${escapeHTML(s.opponent)}</div>
          <input type="number" id="gk-result-them" min="0" value="0" style="width:60px; padding:8px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:20px; text-align:center; box-sizing:border-box;">
        </div>
      </div>
      <button class="btn btn-gold" style="width:100%; margin-top:12px;" onclick="window.saveGKMatchResult()">💾 GUARDAR JOGO</button>
    </div>
    
    <div class="card">
      <h3 style="color:var(--gold); margin:0 0 12px 0; font-size:14px;">📊 Análise por GR</h3>
      ${Object.values(s.gkStats).map(stats => {
        const gk = state.gkRoster.find(p => p.id === stats.playerId);
        const totalMinutes = stats.periods.reduce((sum, p) => sum + ((p.end || s.totalDuration) - p.start), 0);
        const periodsStr = stats.periods.map(p => `${p.start}'-${p.end || s.totalDuration}'`).join(', ');
        const score = calculateGKScore(stats);
        const scoreColor = score >= 70 ? 'var(--green)' : (score >= 40 ? 'var(--yellow)' : 'var(--red)');
        
        return `
          <div style="background:var(--surface-2); padding:12px; border-radius:8px; margin-bottom:10px;">
            <div style="font-size:13px; font-weight:bold; color:var(--gold); margin-bottom:8px;">
               ${gk ? escapeHTML(gk.name) : 'GR'} — ${totalMinutes}' (${periodsStr}) — <span style="color:${scoreColor};">${score}%</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px;">
              <div> Golos: <b style="color:var(--red);">${stats.goalsConceded}</b></div>
              <div>🧤 Defesas: <b style="color:var(--green);">${calculateTotalSaves(stats)}</b></div>
              <div>⚠️ Faltas Com.: <b>${stats.faultsCommitted}</b></div>
              <div>⚠️ Faltas Sof.: <b>${stats.faultsSuffered}</b></div>
              <div>🎯 Falta Área: <b>${stats.faultsSufferedInArea}</b></div>
              <div> Penálti: <b>${stats.penaltyCommitted}</b></div>
              <div>🟨 Amarelos: <b>${stats.yellowCards}</b></div>
              <div> Vermelhos: <b>${stats.redCards}</b></div>
            </div>
            <div style="margin-top:8px;">
              <div style="font-size:10px; color:var(--muted); margin-bottom:4px;">Golos por zona:</div>
              <div style="width:100%; max-width:200px; margin:8px auto;">${window.renderGoalSVG(stats.goalsConcededByZone, false, 200)}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="card">
      <button class="btn btn-outline" style="width:100%; margin-bottom:8px;" onclick="window.printGKMatchPDF()">📄 Exportar PDF</button>
      <button class="btn btn-outline" style="width:100%;" onclick="window.newGKMatch()">🆕 Novo Jogo</button>
    </div>
  `;
}

function calculateGKScore(stats) {
  let totalPoints = 0, maxPoints = 0;
  Object.values(stats.counters || {}).forEach(c => {
    const total = c.error + c.insufficient + c.correct + c.excellent;
    totalPoints += (c.error * 0) + (c.insufficient * 1) + (c.correct * 2) + (c.excellent * 3);
    maxPoints += total * 3;
  });
  return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
}

window.saveGKMatchResult = function() {
  const us = parseInt(document.getElementById('gk-result-us').value) || 0;
  const them = parseInt(document.getElementById('gk-result-them').value) || 0;
  
  gkMatchSession.result = { us, them };
  gkMatchSession.status = 'saved';
  
  Object.values(gkMatchSession.gkStats).forEach(stats => { stats.score = calculateGKScore(stats); });
  if (!state.gkMatches) state.gkMatches = [];
  state.gkMatches.push(JSON.parse(JSON.stringify(gkMatchSession)));
  saveState();
  
  gkMatchSession = null;
  window.jogoSubTab = 'ativo';
  showToast('✅ Jogo guardado no histórico!');
  render();
};

window.newGKMatch = function() { gkMatchSession = null; window.jogoSubTab = 'ativo'; render(); };

function renderJogoHistorico() {
  const matches = (state.gkMatches || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (matches.length === 0) return `<div class="empty">📋 Nenhum jogo gravado ainda.<br>Inicia um jogo na aba "Agendados".</div>`;
  
  let html = `<div style="padding:0 16px; display:flex; flex-direction:column; gap:10px;">`;
  matches.forEach(m => {
    const scoreColor = m.result && m.result.us > m.result.them ? 'var(--green)' : (m.result && m.result.us < m.result.them ? 'var(--red)' : 'var(--yellow)');
    html += `
      <div class="card" style="position:relative; padding-right:70px;">
        <div style="cursor:pointer;" onclick="window.viewMatchDetails('${m.id}')">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; color:var(--gold); font-weight:bold;">${escapeHTML(m.opponent)}</span>
            <span style="font-size:11px; color:var(--muted);">${m.date.split('-').reverse().join('/')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; color:var(--muted);">${m.competition} • ${m.location === 'casa' ? '🏠 Casa' : '✈️ Fora'}</span>
            ${m.result ? `<span style="font-size:16px; font-weight:bold; color:${scoreColor};">${m.result.us} -${m.result.them}</span>` : '<span style="font-size:11px; color:var(--muted);">Sem resultado</span>'}
          </div>
          <div style="font-size:10px; color:var(--muted); margin-top:4px;">
            ${Object.keys(m.gkStats || {}).length} GR avaliado(s) • ${m.totalDuration || 90}'
          </div>
        </div>
        <div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; gap:6px;">
          <button style="width:36px; height:36px; background:var(--surface-2); border:1px solid var(--gold); color:var(--gold); border-radius:6px; font-size:14px; cursor:pointer;" onclick="event.stopPropagation(); window.editGKMatch('${m.id}')">✏️</button>
          <button style="width:36px; height:36px; background:var(--surface-2); border:1px solid var(--red); color:var(--red); border-radius:6px; font-size:14px; cursor:pointer;" onclick="event.stopPropagation(); window.deleteGKMatch('${m.id}')">🗑️</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

window.viewMatchDetails = function(matchId) {
  const m = state.gkMatches.find(x => x.id === matchId);
  if (!m) return;
  
  let html = `
    <div class="topbar">
      <h1 style="font-size:18px;">📋 Detalhes do Jogo</h1>
      <p style="color:var(--gold); font-size:12px; margin-top:4px;">${escapeHTML(m.opponent)} — ${m.date.split('-').reverse().join('/')}</p>
    </div>
    <button class="btn btn-outline" style="margin:10px 16px; width:calc(100% - 32px);" onclick="window.jogoSubTab='historico'; render();">← Voltar ao Histórico</button>
  `;
  
  if (m.result) {
    html += `<div class="card" style="text-align:center;"><div style="font-size:24px; font-weight:bold; color:var(--chalk);">${m.result.us} - ${m.result.them}</div><div style="font-size:11px; color:var(--muted); margin-top:4px;">${m.competition} • ${m.location === 'casa' ? '🏠 Casa' : '✈️ Fora'} • ${m.totalDuration || 90}'</div></div>`;
  }
  
  Object.values(m.gkStats).forEach(stats => {
    const gk = state.gkRoster.find(p => p.id === stats.playerId);
    const totalMinutes = stats.periods.reduce((sum, p) => sum + ((p.end || m.totalDuration) - p.start), 0);
    const periodsStr = stats.periods.map(p => `${p.start}'-${p.end || m.totalDuration}'`).join(', ');
    const score = stats.score || calculateGKScore(stats);
    const scoreColor = score >= 70 ? 'var(--green)' : (score >= 40 ? 'var(--yellow)' : 'var(--red)');
    
    html += `
      <div class="card">
        <h3 style="color:var(--gold); margin:0 0 8px 0; font-size:14px;">🧤 ${gk ? escapeHTML(gk.name) : 'GR'} ${gk && gk.number ? '(Nº'+gk.number+')' : ''}<span style="float:right; color:${scoreColor};">${score}%</span></h3>
        <div style="font-size:11px; color:var(--muted); margin-bottom:10px;">⏱️ ${totalMinutes}' em campo (${periodsStr})</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">GOLOS SOFRIDOS</div><div style="font-size:20px; font-weight:bold; color:var(--red);">${stats.goalsConceded}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">DEFESAS</div><div style="font-size:20px; font-weight:bold; color:var(--green);">${calculateTotalSaves(stats)}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">FALTAS COMETIDAS</div><div style="font-size:20px; font-weight:bold; color:var(--yellow);">${stats.faultsCommitted}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">FALTAS SOFRIDAS</div><div style="font-size:20px; font-weight:bold; color:var(--yellow);">${stats.faultsSuffered}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">FALTA NA ÁREA</div><div style="font-size:20px; font-weight:bold; color:var(--gold);">${stats.faultsSufferedInArea}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">PENÁLTIS</div><div style="font-size:20px; font-weight:bold; color:var(--red);">${stats.penaltyCommitted}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">AMARELOS</div><div style="font-size:20px; font-weight:bold; color:var(--yellow);">${stats.yellowCards}</div></div>
          <div style="background:var(--surface-2); padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:var(--muted);">VERMELHOS</div><div style="font-size:20px; font-weight:bold; color:var(--red);">${stats.redCards}</div></div>
        </div>
        
        <div style="margin-bottom:12px;">
          <h4 style="font-size:11px; font-weight:bold; color:var(--gold); margin:0 0 6px 0; text-transform:uppercase;">⚽ Golos Marcados (GR)</h4>
          <div style="font-size:11px; display:flex; gap:12px;"><span>5vs4: <b>${stats.goalsScored['5vs4'] || 0}</b></span><span>Remate Def.: <b>${stats.goalsScored['remate-defensivo'] || 0}</b></span><span>Remate Of.: <b>${stats.goalsScored['remate-ofensivo'] || 0}</b></span></div>
        </div>
        
        <div style="margin-bottom:12px;">
          <h4 style="font-size:11px; font-weight:bold; color:var(--gold); margin:0 0 6px 0; text-transform:uppercase;">🥅 Golos Sofridos por Zona</h4>
          <div style="width:100%; max-width:220px; margin:8px auto;">${window.renderGoalSVG(stats.goalsConcededByZone, false, 220)}</div>
        </div>
        
        <div style="margin-bottom:12px;">
          <h4 style="font-size:11px; font-weight:bold; color:var(--gold); margin:0 0 6px 0; text-transform:uppercase;">⚠️ Faltas por Zona</h4>
          <div style="font-size:11px; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div>Cometidas Ofensivas: <b>${stats.faultsCommittedByZone.ofensivo || 0}</b></div>
            <div>Cometidas Defensivas: <b>${stats.faultsCommittedByZone.defensivo || 0}</b></div>
            <div>Sofridas Ofensivas: <b>${stats.faultsSufferedByZone.ofensivo || 0}</b></div>
            <div>Sofridas Defensivas: <b>${stats.faultsSufferedByZone.defensivo || 0}</b></div>
          </div>
        </div>
        
        <div style="margin-bottom:12px;">
          <h4 style="font-size:11px; font-weight:bold; color:var(--gold); margin:0 0 6px 0; text-transform:uppercase;">⭐ Liderança</h4>
          <div style="font-size:11px; display:flex; gap:12px;">
            <span>Comunicação: <b>${'★'.repeat(stats.leadership.communication || 0)}${'☆'.repeat(5 - (stats.leadership.communication || 0))}</b></span>
            <span>Liderança: <b>${'★'.repeat(stats.leadership.leadership || 0)}${'☆'.repeat(5 - (stats.leadership.leadership || 0))}</b></span>
          </div>
        </div>
        
        <div>
          <h4 style="font-size:11px; font-weight:bold; color:var(--gold); margin:0 0 6px 0; text-transform:uppercase;">📊 Contadores de Técnicas</h4>
          ${renderGKCountersReadOnly(stats.counters || {})}
        </div>
      </div>
    `;
  });
  
  html += `<div class="card"><button class="btn btn-gold" style="width:100%;" onclick="window.printMatchPDF('${m.id}')">📄 Exportar PDF</button></div>`;
  document.getElementById('app').innerHTML = html;
};

function renderGKCountersReadOnly(counters) {
  let html = '';
  gkMatchCategories.forEach(cat => {
    const catTotal = cat.actions.reduce((sum, a) => {
      const c = counters[a.id] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
      return sum + c.error + c.insufficient + c.correct + c.excellent;
    }, 0);
    if (catTotal === 0) return;
    
    html += `
      <div style="margin-bottom:8px; border:1px solid var(--line); border-radius:8px; overflow:hidden;">
        <div style="padding:8px 10px; background:var(--surface-2);"><span style="font-size:11px; color:var(--gold); font-weight:bold;">${cat.icon} ${cat.label} <span style="color:var(--muted); font-size:10px;">(${catTotal} ações)</span></span></div>
        <div style="padding:4px 8px;">
          ${cat.actions.map(a => {
            const c = counters[a.id] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
            const total = c.error + c.insufficient + c.correct + c.excellent;
            if (total === 0) return '';
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--line); font-size:11px;">
                <span style="color:var(--chalk);">${a.label}</span>
                <span style="display:flex; gap:8px;">
                  ${c.error > 0 ? `<span style="color:var(--red);">${c.error}</span>` : ''}
                  ${c.insufficient > 0 ? `<span style="color:#F97316;">🟠${c.insufficient}</span>` : ''}
                  ${c.correct > 0 ? `<span style="color:var(--yellow);">🟡${c.correct}</span>` : ''}
                  ${c.excellent > 0 ? `<span style="color:var(--green);">✅${c.excellent}</span>` : ''}
                </span>
              </div>
            `;
          }).filter(x => x).join('')}
        </div>
      </div>
    `;
  });
  return html || '<div style="font-size:11px; color:var(--muted);">Sem técnicas registadas</div>';
}

function renderGKCountersReadOnlyPrint(counters) {
  let html = '';
  gkMatchCategories.forEach(cat => {
    const catTotal = cat.actions.reduce((sum, a) => {
      const c = counters[a.id] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
      return sum + c.error + c.insufficient + c.correct + c.excellent;
    }, 0);
    if (catTotal === 0) return;
    
    html += `
      <div style="margin-bottom:8px; border:1px solid #E5E7EB; border-radius:8px; overflow:hidden;">
        <div style="padding:8px 10px; background:#F9FAFB;"><span style="font-size:11px; color:#D9A441; font-weight:bold;">${cat.icon} ${cat.label} <span style="color:#6B7280; font-size:10px;">(${catTotal} ações)</span></span></div>
        <div style="padding:4px 8px;">
          ${cat.actions.map(a => {
            const c = counters[a.id] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
            const total = c.error + c.insufficient + c.correct + c.excellent;
            if (total === 0) return '';
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #E5E7EB; font-size:11px;">
                <span style="color:#0E211A; font-weight:bold;">${a.label}</span>
                <span style="display:flex; gap:8px;">
                  ${c.error > 0 ? `<span style="color:#DC2626;">❌${c.error}</span>` : ''}
                  ${c.insufficient > 0 ? `<span style="color:#D97706;">🟠${c.insufficient}</span>` : ''}
                  ${c.correct > 0 ? `<span style="color:#D9A441;">🟡${c.correct}</span>` : ''}
                  ${c.excellent > 0 ? `<span style="color:#16A34A;">✅${c.excellent}</span>` : ''}
                </span>
              </div>
            `;
          }).filter(x => x).join('')}
        </div>
      </div>
    `;
  });
  return html || '<div style="font-size:11px; color:#6B7280;">Sem técnicas registadas</div>';
}

window.printMatchPDF = function(matchId) {
  let m = (state.gkMatches || []).find(x => x.id === matchId) || (gkMatchSession && gkMatchSession.id === matchId ? gkMatchSession : null);
  if (!m) return showToast('Erro: Jogo não encontrado.');
  
  let html = `
    <div style="font-family:Arial, sans-serif; padding:20px; max-width:600px; margin:0 auto; page-break-inside:avoid; background:#fff;">
      <div style="text-align:center; border-bottom:3px solid #D9A441; padding-bottom:12px; margin-bottom:20px;">
        <h1 style="color:#0E211A; margin:0; font-size:22px;">COACHFOLIO GK PRO</h1>
        <p style="color:#8FA79B; margin:4px 0 0 0; font-size:11px;">Relatório de Jogo — Guarda-Redes</p>
      </div>
      <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:12px; margin-bottom:16px; color:#0E211A;">
        <div style="display:flex; justify-content:space-between; font-size:12px;">
          <div><b>Adversário:</b> ${escapeHTML(m.opponent)}</div><div><b>Local:</b> ${m.location === 'casa' ? 'Casa' : 'Fora'}</div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:6px;">
          <div><b>Competição:</b> ${m.competition}</div><div><b>Data:</b> ${m.date.split('-').reverse().join('/')}</div>
        </div>
        ${m.result ? `<div style="text-align:center; margin-top:12px; font-size:24px; font-weight:bold; color:#0E211A;">${m.result.us} -${m.result.them}</div>` : ''}
      </div>
      
      ${Object.values(m.gkStats).map(stats => {
        const gk = state.gkRoster.find(p => p.id === stats.playerId);
        const totalMinutes = stats.periods.reduce((sum, p) => sum + ((p.end || m.totalDuration) - p.start), 0);
        const periodsStr = stats.periods.map(p => `${p.start}'-${p.end || m.totalDuration}'`).join(', ');
        const score = stats.score || calculateGKScore(stats);
        const scoreColor = score >= 70 ? '#16A34A' : (score >= 40 ? '#D97706' : '#DC2626');
        
        const gs = stats.goalsScored || {};
        const matchGoals = (gs['5vs4'] || 0) + (gs['remate-defensivo'] || 0) + (gs['remate-ofensivo'] || 0);
        
        return `
          <div style="border:1px solid #E5E7EB; border-radius:8px; padding:12px; margin-bottom:16px; page-break-inside:avoid; color:#0E211A;">
            <h2 style="color:#D9A441; margin:0 0 8px 0; font-size:16px; border-bottom:2px solid #0E211A; padding-bottom:4px;">
              🧤 ${gk ? escapeHTML(gk.name) : 'GR'} ${gk && gk.number ? '(Nº'+gk.number+')' : ''}<span style="float:right; color:${scoreColor}; font-size:14px;">${score}%</span>
            </h2>
            <div style="font-size:11px; color:#6B7280; margin-bottom:10px;">⏱️ ${totalMinutes}' em campo (${periodsStr})</div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
              <div style="background:#FEF2F2; padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:#6B7280;">GOLOS SOFRIDOS</div><div style="font-size:20px; font-weight:bold; color:#DC2626;">${stats.goalsConceded}</div></div>
              <div style="background:#F0FDF4; padding:8px; border-radius:6px; text-align:center;"><div style="font-size:10px; color:#6B7280;">DEFESAS</div><div style="font-size:20px; font-weight:bold; color:#16A34A;">${calculateTotalSaves(stats)}</div></div>${matchGoals > 0 ? `<div style="background:#F9FAFB; border:1px solid #E5E7EB; padding:8px; border-radius:6px; text-align:center; grid-column: span 2;"><div style="font-size:10px; color:#6B7280;">GOLOS MARCADOS</div><div style="font-size:20px; font-weight:bold; color:#0E211A;">${matchGoals} ⚽</div></div>` : ''}
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; font-size:10px;">
              <div style="background:#F9FAFB; padding:6px; border-radius:6px; text-align:center; border:1px solid #E5E7EB;"><div style="color:#6B7280; margin-bottom:2px;">FALTAS COMETIDAS</div><div style="font-size:14px; font-weight:bold; color:#D97706;">${stats.faultsCommitted}</div></div>
              <div style="background:#F9FAFB; padding:6px; border-radius:6px; text-align:center; border:1px solid #E5E7EB;"><div style="color:#6B7280; margin-bottom:2px;">FALTAS SOFRIDAS</div><div style="font-size:14px; font-weight:bold; color:#D97706;">${stats.faultsSuffered}</div></div>
              <div style="background:#FEF2F2; padding:6px; border-radius:6px; text-align:center; border:1px solid #E5E7EB;"><div style="color:#6B7280; margin-bottom:2px;">PENÁLTIS COM.</div><div style="font-size:14px; font-weight:bold; color:#DC2626;">${stats.penaltyCommitted}</div></div>
              <div style="background:#F9FAFB; padding:6px; border-radius:6px; text-align:center; border:1px solid #E5E7EB;"><div style="color:#6B7280; margin-bottom:2px;">CARTÕES AMARELOS</div><div style="font-size:14px; font-weight:bold; color:#D97706;">${stats.yellowCards}</div></div>
              <div style="background:#FEF2F2; padding:6px; border-radius:6px; text-align:center; border:1px solid #E5E7EB;"><div style="color:#6B7280; margin-bottom:2px;">CARTÕES VERMELHOS</div><div style="font-size:14px; font-weight:bold; color:#DC2626;">${stats.redCards}</div></div>
              <div style="background:#F9FAFB; padding:6px; border-radius:6px; text-align:center; border:1px solid #E5E7EB;"><div style="color:#6B7280; margin-bottom:2px;">FALTA NA ÁREA</div><div style="font-size:14px; font-weight:bold; color:#D9A441;">${stats.faultsSufferedInArea}</div></div>
            </div>

            <div style="margin-bottom:12px;">
              <h3 style="font-size:12px; font-weight:bold; color:#0E211A; margin:0 0 8px 0;">🥅 Golos Sofridos por Zona</h3>
              <div style="width:100%; max-width:220px; margin:0 auto;">${window.renderGoalSVG(stats.goalsConcededByZone, false, 220)}</div>
            </div>
            <div style="margin-bottom:12px;">
              <h3 style="font-size:12px; font-weight:bold; color:#0E211A; margin:0 0 8px 0;">📊 Técnicas</h3>
              ${renderGKCountersReadOnlyPrint(stats.counters || {})}
            </div>
          </div>
        `;
      }).join('')}
      
      <div style="font-size:8px; color:#9CA3AF; margin-top:16px; border-top:1px solid #E5E7EB; padding-top:8px;">
        * A avaliação (Score %) é calculada através da ponderação das ações técnicas: Excelente (3 pontos), Correto (2 pontos), Insuficiente (1 ponto) e Erro (0 pontos).
      </div>
    </div>
  `;
  
  const printArea = document.getElementById('print-area');
  if (printArea) {
    // Esconder a APP de fundo e mostrar o espaço branco do relatório
    document.getElementById('app').style.display = 'none';
    printArea.style.display = 'block';
    printArea.innerHTML = `
      <div id="print-ui-bar" style="position:fixed; top:0; left:0; right:0; background:#0E211A; padding:16px; display:flex; justify-content:space-between; align-items:center; z-index:100000; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <button style="background:transparent; border:1px solid #D9A441; color:#D9A441; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:13px; cursor:pointer;" onclick="fecharRelatorio()">❌ Fechar</button>
        <button id="btn-export-pdf" style="background:#D9A441; color:#0E211A; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; font-size:13px; cursor:pointer;" onclick="partilharRelatorio('Relatorio_Jogo_Coachfolio.jpg')">📤 Partilhar / Guardar</button>
      </div>
      <div id="pdf-content" style="padding-top:70px; background:#fff; min-height:100vh;">
        ${html}
      </div>
    `;

    window.fecharRelatorio = function() {
      printArea.style.display = 'none';
      printArea.innerHTML = '';
      document.getElementById('app').style.display = 'block';
    };

    window.partilharRelatorio = async function(nome) {
      const btn = document.getElementById('btn-export-pdf');
      const barra = document.getElementById('print-ui-bar');
      btn.innerHTML = '⏳ A gerar...';
      
      // Esconder a barra para não sair na fotografia
      barra.style.display = 'none'; 
      
      try {
        const elemento = document.getElementById('pdf-content');
        // Tira uma "fotografia" em alta qualidade ao relatório
        const canvas = await html2canvas(elemento, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        
        canvas.toBlob(async (blob) => {
          const file = new File([blob], nome, { type: 'image/jpeg' });
          
          // Abre a partilha nativa do iPhone / Android
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Relatório CoachFolio GK',
              text: 'Relatório de Jogo do Guarda-Redes'
            });
            window.fecharRelatorio(); // Fecha o ecrã se partilhar com sucesso
          } else {
            // Plano B (se estiver no PC): Faz download do ficheiro
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

window.printGKMatchPDF = function() { if (gkMatchSession) window.printMatchPDF(gkMatchSession.id); };

window.deleteGKMatch = function(matchId) {
  const m = state.gkMatches.find(x => x.id === matchId);
  if (!m) return;
  if (confirm(`Apagar o jogo contra ${m.opponent}?`)) {
    state.gkMatches = state.gkMatches.filter(x => x.id !== matchId);
    saveState(); render(); showToast('🗑️ Jogo apagado!');
  }
};

window.editGKMatch = function(matchId) {
  const m = state.gkMatches.find(x => x.id === matchId);
  if (!m) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'edit-match-modal';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  
  modal.innerHTML = `
    <div class="modal-card" style="max-width:420px;">
      <h3 style="color:var(--gold); text-align:center; margin-top:0;">️ Editar Jogo</h3>
      <p style="font-size:11px; color:var(--muted); text-align:center; margin-bottom:16px;">${escapeHTML(m.opponent)}</p>
      <div class="field">
        <label>Resultado Final</label>
        <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center;">
          <input type="number" id="edit-result-us" min="0" value="${m.result ? m.result.us : 0}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:18px; text-align:center; box-sizing:border-box;">
          <span style="font-size:20px; color:var(--muted);">-</span>
          <input type="number" id="edit-result-them" min="0" value="${m.result ? m.result.them : 0}" style="width:100%; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:18px; text-align:center; box-sizing:border-box;">
        </div>
      </div>
      <div class="field">
        <label>Notas do Jogo (opcional)</label>
        <textarea id="edit-match-notes" style="width:100%; min-height:80px; padding:10px; background:var(--surface-2); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:12px; box-sizing:border-box;">${m.notes || ''}</textarea>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:16px;">
        <button class="btn btn-gold" style="width:100%;" onclick="window.saveGKMatchEdit('${m.id}')">💾 Guardar Alterações</button>
        <button class="btn btn-outline" style="width:100%;" onclick="window.continueGKMatchEval('${m.id}')">📊 Continuar Avaliação (reabrir contadores)</button>
        <button class="btn btn-outline" style="width:100%; border-color:var(--muted); color:var(--muted);" onclick="document.getElementById('edit-match-modal').remove()">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.saveGKMatchEdit = function(matchId) {
  const m = state.gkMatches.find(x => x.id === matchId);
  if (!m) return;
  const us = parseInt(document.getElementById('edit-result-us').value) || 0;
  const them = parseInt(document.getElementById('edit-result-them').value) || 0;
  const notes = document.getElementById('edit-match-notes').value.trim();
  m.result = { us, them };
  if (notes) m.notes = notes;
  saveState();
  document.getElementById('edit-match-modal').remove();
  showToast('✅ Jogo atualizado!'); render();
};

window.continueGKMatchEval = function(matchId) {
  const m = state.gkMatches.find(x => x.id === matchId);
  if (!m) return;
  gkMatchSession = JSON.parse(JSON.stringify(m));
  gkMatchSession.status = 'active';
  const activeGK = gkMatchSession.gkStats[gkMatchSession.activeGKId];
  if (activeGK) {
    const lastPeriod = activeGK.periods[activeGK.periods.length - 1];
    if (lastPeriod.end !== null) lastPeriod.end = null;
  }
  state.gkMatches = state.gkMatches.filter(x => x.id !== matchId);
  saveState(); document.getElementById('edit-match-modal').remove();
  window.jogoSubTab = 'ativo'; render(); showToast('📊 Sessão reaberta!');
};

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}