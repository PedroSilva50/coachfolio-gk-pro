// ==========================================
// COACHFOLIO GK PRO — Módulo de Análise GR
// Apenas: Análise (ranking e evolução)
// Os jogos vêm de state.gkMatches (aba Jogo)
// ==========================================

// Inicialização segura
if (!window.grEvalMode) window.grEvalMode = 'analise';

// ==========================================
// RENDER PRINCIPAL — Integração na aba Equipa
// ==========================================
window.renderGRModule = function() {
  if (typeof state === 'undefined' || !state.gkRoster) {
    return `<div class="empty">🧤 Dados não disponíveis.</div>`;
  }
  
  const gkPlayers = state.gkRoster || [];
  
  if (gkPlayers.length === 0) {
    return `<div class="empty">🧤 Nenhum Guarda-Redes no plantel.<br>Adiciona GRs na aba Plantel primeiro.</div>`;
  }
  
  // SELETOR DE GUARDA-REDES
  let html = `
    <div style="margin-bottom:12px; padding: 0 16px;">
      <select id="gr-select" onchange="window.selectedGR=this.value; render();" style="width:100%; padding:10px; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:8px; font-size:13px; font-weight:bold; text-align:center;">
        <option value="">-- Escolher Guarda-Redes --</option>
        ${gkPlayers.map(p => `<option value="${p.id}" ${window.selectedGR===p.id?'selected':''}>${p.number ? p.number + ' - ' : ''}${escapeHTML(p.name)}</option>`).join('')}
      </select>
    </div>
  `;
  
  if (!window.selectedGR) return html;
  
  const gk = gkPlayers.find(p => p.id === window.selectedGR);
  if (!gk) return html;
  
  // Abas internas do Módulo de Análise
  html += `
    <div class="seg" style="margin: 0 16px 14px 16px;">
      <div class="seg-btn ${window.grEvalMode==='analise'?'active':''}" onclick="window.grEvalMode='analise'; render();">📊 Análise de Forma</div>
    </div>
  `;
  
  html += renderGKAnalysis(gk, gkPlayers);
  
  return html;
};

// ==========================================
// ANÁLISE (Ranking e Evolução)
// ==========================================
function renderGKAnalysis(currentGK, allGKs) {
  const matches = state.gkMatches || [];
  
  // 1. RANKING DE GUARDA-REDES (Baseado em Score Médio de Jogos)
  const rankings = allGKs.map(gk => {
    const gkMatches = matches.filter(m => m.gkStats && m.gkStats[gk.id]);
    if (gkMatches.length === 0) return null;
    
    let totalScore = 0;
    let totalMinutes = 0;
    let totalGoalsConceded = 0;
    let totalSaves = 0;
    
    gkMatches.forEach(m => {
      const stats = m.gkStats[gk.id];
      totalScore += stats.score || 0;
      // Correção: Usa a duração total do jogo para fechar o período
      totalMinutes += stats.periods.reduce((sum, p) => sum + ((p.end || m.totalDuration) - p.start), 0);
      totalGoalsConceded += stats.goalsConceded || 0;
      
      const saveActions = ['parede', 'queda', 'barreirista', 'def_alta', '1vs1', 'inferioridades'];
      const saves = saveActions.reduce((total, actionId) => {
        const c = stats.counters?.[actionId] || { error: 0, insufficient: 0, correct: 0, excellent: 0 };
        return total + c.error + c.insufficient + c.correct + c.excellent;
      }, 0);
      totalSaves += saves;
    });
    
    return { 
      gk, 
      avgScore: Math.round(totalScore / gkMatches.length), 
      count: gkMatches.length,
      totalMinutes,
      totalGoalsConceded,
      totalSaves
    };
  }).filter(r => r !== null).sort((a, b) => b.avgScore - a.avgScore);
  
  let html = `<div style="display:flex; flex-direction:column; gap:12px; padding: 0 16px;">`;
  
  // CARD DE RANKING (Apenas se houver jogos na app)
  html += `
    <div class="card" style="margin: 0; padding:12px;">
      <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:14px; text-transform:uppercase;">🏆 Ranking de Score</h3>
      ${rankings.length === 0 ? '<div style="font-size:11px; color:var(--muted); text-align:center;">Sem dados suficientes. Inicia jogos na aba "Dia de Jogo".</div>' : ''}
      <div style="display:flex; flex-direction:column; gap:6px;">
          ${rankings.map((r, idx) => {
            const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `${idx+1}º`));
            const isCurrent = r.gk.id === currentGK.id;
            const sColor = r.avgScore >= 70 ? 'var(--green)' : (r.avgScore >= 40 ? 'var(--yellow)' : 'var(--red)');
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:${isCurrent ? 'var(--gold-dim)' : 'var(--surface-2)'}; border:1px solid ${isCurrent ? 'var(--gold)' : 'var(--line)'}; border-radius:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:16px;">${medal}</span>
                  <span style="font-size:13px; font-weight:bold; color:${isCurrent ? 'var(--gold)' : 'var(--chalk)'};">${escapeHTML(r.gk.name)}</span>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:16px; font-weight:bold; color:${sColor};">${r.avgScore}%</span>
                  <div style="font-size:9px; color:var(--muted); text-transform:uppercase;">${r.count} jogo${r.count !== 1 ? 's' : ''}</div>
                </div>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `;
  
  // ESTATÍSTICAS E GRÁFICOS DO GR SELECIONADO
  const currentMatches = matches.filter(m => m.gkStats && m.gkStats[currentGK.id]).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (currentMatches.length > 0) {
    const currentStats = rankings.find(r => r.gk.id === currentGK.id);
    
    // RESUMO GLOBAL DO GR
    html += `
      <div class="card" style="margin: 0; padding:12px;">
        <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:14px; text-transform:uppercase;">📊 Resumo de ${escapeHTML(currentGK.name)}</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div style="background:var(--surface-2); padding:10px; border-radius:8px; border:1px solid var(--line); text-align:center;">
            <div style="font-size:22px; font-weight:bold; color:var(--chalk);">${currentStats.count}</div>
            <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-top:2px;">Jogos</div>
          </div>
          <div style="background:var(--surface-2); padding:10px; border-radius:8px; border:1px solid var(--line); text-align:center;">
            <div style="font-size:22px; font-weight:bold; color:var(--gold);">${currentStats.totalMinutes}'</div>
            <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-top:2px;">Minutos</div>
          </div>
          <div style="background:var(--surface-2); padding:10px; border-radius:8px; border:1px solid var(--line); text-align:center;">
            <div style="font-size:22px; font-weight:bold; color:var(--red);">${currentStats.totalGoalsConceded}</div>
            <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-top:2px;">Golos Sofridos</div>
          </div>
          <div style="background:var(--surface-2); padding:10px; border-radius:8px; border:1px solid var(--line); text-align:center;">
            <div style="font-size:22px; font-weight:bold; color:var(--green);">${currentStats.totalSaves}</div>
            <div style="font-size:10px; color:var(--muted); text-transform:uppercase; margin-top:2px;">Defesas</div>
          </div>
        </div>
      </div>
    `;
    
    // GRÁFICO DE EVOLUÇÃO
    const chronologicalMatches = [...currentMatches].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    html += `
      <div class="card" style="margin: 0; padding:12px;">
        <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:14px; text-transform:uppercase;">📈 Evolução da Forma (Score)</h3>
        <div style="display:flex; align-items:flex-end; gap:6px; height:130px; padding:10px 0; border-bottom:1px solid var(--line);">
          ${chronologicalMatches.map(m => {
            const stats = m.gkStats[currentGK.id];
            const score = stats.score || 0;
            const height = Math.max(5, score); // Altura mínima para a barra ser visível
            const color = score >= 70 ? 'var(--green)' : (score >= 40 ? 'var(--yellow)' : 'var(--red)');
            return `
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; group;">
                <div style="font-size:9px; color:${color}; font-weight:bold; margin-bottom:4px;">${score}%</div>
                <div style="width:100%; max-width:24px; height:${height}\%; background:${color}; border-radius:4px 4px 0 0;"></div>
                <div style="font-size:8px; color:var(--muted); margin-top:4px;">${m.date.split('-').slice(1).reverse().join('/')}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    // LISTA DE JOGOS DO GR (Acesso rápido ao relatório)
    html += `
      <div class="card" style="margin: 0; padding:12px;">
        <h3 style="color:var(--gold); margin:0 0 10px 0; font-size:14px; text-transform:uppercase;">📋 Histórico de Jogos</h3>
        <div style="display:flex; flex-direction:column; gap:6px;">
        ${currentMatches.map(m => {
          const stats = m.gkStats[currentGK.id];
          const totalMinutes = stats.periods.reduce((sum, p) => sum + ((p.end || m.totalDuration) - p.start), 0);
          const score = stats.score || 0;
          const scoreColor = score >= 70 ? 'var(--green)' : (score >= 40 ? 'var(--yellow)' : 'var(--red)');
          
          return `
            <div style="background:var(--surface-2); padding:12px; border-radius:8px; border:1px solid var(--line); font-size:11px; cursor:pointer; transition: opacity 0.2s;" onclick="this.style.opacity='0.5'; window.jogoSubTab='historico'; navigate('jogo'); setTimeout(() => window.viewMatchDetails('${m.id}'), 100);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:var(--chalk); font-size:13px; font-weight:bold;">vs ${escapeHTML(m.opponent)}</span>
                <span style="color:${scoreColor}; font-size:16px; font-weight:bold;">${score}%</span>
              </div>
              <div style="display:flex; justify-content:space-between; color:var(--muted);">
                <span>${m.date.split('-').reverse().join('/')} •${totalMinutes}' jogados</span>
                <span><b style="color:var(--red);">🥅 ${stats.goalsConceded}</b> | <b style="color:var(--green);">🧤 ${calculateTotalSaves(stats)}</b></span>
              </div>
            </div>
          `;
        }).join('')}
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="empty">
        <div style="font-size:30px; margin-bottom:10px;">📋</div>
        <b>${escapeHTML(currentGK.name)}</b> ainda não tem jogos analisados.<br><br>
        Inicia um jogo na aba <b>Dia de Jogo</b> para gerar dados.
      </div>
    `;
  }
  
  html += `</div>`;
  return html;
}

// Helper: Segurança contra quebra de HTML
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}