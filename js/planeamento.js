// ==========================================
// COACHFOLIO GK PRO — Módulo de Planeamento
// Focado apenas em Microciclo e Treinos de GR
// ==========================================

window.planTab = window.planTab || 'microciclo';
let trainingForm = null;
let expandedTraining = null;
window.videoForm = null; // NOVO: Controlo do formulário de vídeos

// ==========================================
// FUNÇÕES DE CONFIRMAÇÃO (MODAIS ELEGANTES)
// ==========================================
window.askConfirm = function(message, onConfirm, btnClass) {
    window.modalConfig = { type: 'confirm', message: message, onConfirm: onConfirm, btnClass: btnClass };
    const root = document.getElementById('modal-root');
    if (root) {
        root.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target===this) window.closeModal()">
            <div class="modal-card" style="text-align:center;">
                <p style="font-size:14px; font-weight:bold; color:var(--chalk); margin-bottom:20px;">${message}</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-outline" style="flex:1;" onclick="window.closeModal()">Cancelar</button>
                    <button class="btn ${btnClass || 'btn-red'}" style="flex:1;" onclick="window.confirmModal()">Confirmar</button>
                </div>
            </div>
        </div>`;
    }
};

window.confirmModal = function() {
    if (window.modalConfig && typeof window.modalConfig.onConfirm === 'function') {
        window.modalConfig.onConfirm();
    }
    if (typeof window.closeModal === 'function') window.closeModal();
};

// ==========================================
// RENDER PRINCIPAL DO PLANEAMENTO
// ==========================================
window.renderPlaneamento = function() {
    let html = `
    <div>
        <div class="topbar">
            <h1 style="font-size:18px;">PLANEAMENTO</h1>
        </div>
        
        <div class="seg" style="margin:10px 16px;">
            <div class="seg-btn ${window.planTab === 'microciclo' ? 'active' : ''}" onclick="window.planTab='microciclo'; render();">📅 Microciclo</div>
            <div class="seg-btn ${window.planTab === 'treinos' ? 'active' : ''}" onclick="window.planTab='treinos'; render();">🏋️ Treinos</div>
            <div class="seg-btn ${window.planTab === 'videos' ? 'active' : ''}" onclick="window.planTab='videos'; render();">🎥 Vídeos</div>
        </div>
    `;

    if (window.planTab === 'microciclo') {
        html += renderMicrociclo();
    } else if (window.planTab === 'treinos') {
        html += renderTreinos();
    } else {
        html += renderVideos(); // NOVO: Render da Biblioteca de Vídeos
    }

    html += `</div>`;
    return html;
};

// ==========================================
// 1. MICROCICLO SEMANAL
// ==========================================
window.microcycleDate = window.microcycleDate || new Date();

window.getMonday = function(d) {
    let date = new Date(d);
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

window.changeMicrocycleWeek = function(offset) {
    window.microcycleDate.setDate(window.microcycleDate.getDate() + (offset * 7));
    render();
};

function renderMicrociclo() {
    const mon = window.getMonday(window.microcycleDate);
    const days = [];
    for(let i=0; i<7; i++) {
        let d = new Date(mon);
        d.setDate(mon.getDate() + i);
        days.push(d);
    }

    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    let monStr = days[0].toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
    let sunStr = days[6].toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
    
    let html = `
    <div style="padding: 0 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:10px; border-radius:8px; margin-bottom:14px; border:1px solid var(--line);">
            <button class="btn btn-outline" style="padding:6px 12px;" onclick="window.changeMicrocycleWeek(-1)">⬅️</button>
            <div style="text-align:center;">
                <div style="font-size:10px; color:var(--muted); text-transform:uppercase; font-weight:bold; letter-spacing:0.05em;">Semana de Trabalho</div>
                <div style="font-size:13px; color:var(--gold); font-weight:bold; margin-top:2px;">${monStr} a ${sunStr}</div>
            </div>
            <button class="btn btn-outline" style="padding:6px 12px;" onclick="window.changeMicrocycleWeek(1)">➡️</button>
        </div>
        
        <div style="display:flex; gap:10px; margin-bottom:14px;">
            <button class="btn btn-outline" style="flex:1; padding:8px 4px; font-size:11px;" onclick="window.microcycleDate = new Date(); render();">📅 Ir para Hoje</button>
            <button class="btn btn-gold" style="flex:1; padding:8px 4px; font-size:11px;" onclick="window.openMesocicloModal()">📄 Mesociclo Por Datas</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:8px;">
    `;

    const weekDates = days.map(d => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    });

    const weekTrs = (state.trainings || []).filter(t => weekDates.includes(t.date));
    const weekMats = (state.gkMatches || []).filter(m => weekDates.includes(m.date)); 

    days.forEach((d, idx) => {
        const dateIso = weekDates[idx];
        const dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

        const trs = weekTrs.filter(t => t.date === dateIso);
        const mats = weekMats.filter(m => m.date === dateIso);

        let eventsHtml = '';
        if(trs.length === 0 && mats.length === 0) {
            eventsHtml = `<div style="color:var(--muted); font-size:11px; font-weight:bold; display:flex; align-items:center; gap:6px; padding:6px 0;">🛋️ Folga / Recuperação</div>`;
        } else {
            trs.forEach(tr => {
                let dur = tr.duration || 90;
                eventsHtml += `<div style="background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--green); padding:8px 10px; border-radius:6px; margin-bottom:6px;">
                    <div style="display:flex; justify-content:space-between;">
                      <div style="font-size:11px; color:var(--green); font-weight:bold; text-transform:uppercase;">🏋️ Treino de GR</div>
                      <div style="font-size:11px; color:var(--muted); font-weight:bold;">${dur}'</div>
                    </div>
                    ${tr.plan ? `<div style="font-size:10px; color:var(--chalk); margin-top:6px; white-space:pre-wrap; overflow-wrap:break-word;">${escapeHTML(tr.plan)}</div>` : ''}
                </div>`;
            });
            mats.forEach(m => {
                let isHome = m.location === 'casa';
                let isDone = m.status === 'saved' ? '🟢' : '🟡';
                eventsHtml += `<div style="background:var(--surface); border:1px solid var(--line); border-left:3px solid var(--gold); padding:8px 10px; border-radius:6px; margin-bottom:6px;">
                    <div style="display:flex; justify-content:space-between;">
                       <div style="font-size:11px; color:var(--gold); font-weight:bold; text-transform:uppercase;">⚽ Jogo ${isDone}</div>
                       <div style="font-size:11px; color:var(--muted); font-weight:bold;">${isHome ? 'CASA' : 'FORA'}</div>
                    </div>
                    <div style="font-size:12px; color:var(--chalk); margin-top:4px; font-weight:bold;">vs ${escapeHTML(m.opponent)}</div>
                </div>`;
            });
        }

        const todayIso = new Date().toISOString().slice(0,10);
        const isToday = dateIso === todayIso;
        const borderCol = isToday ? 'border:1px solid var(--gold);' : 'border:1px solid var(--line);';

        html += `
        <div class="card" style="padding:10px; margin:0 0 8px 0; ${borderCol}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; border-bottom:1px solid var(--line); padding-bottom:6px;">
                <span style="font-size:11px; font-weight:bold; color:${isToday ? 'var(--gold)' : 'var(--chalk)'}; text-transform:uppercase;">${dayNames[idx]} ${isToday ? '(Hoje)' : ''}</span>
                <span style="font-size:10px; color:var(--muted); font-weight:bold;">${dayStr}</span>
            </div>
            ${eventsHtml}
        </div>
        `;
    });

    html += `</div></div>`;
    return html;
}

// ==========================================
// 2. TREINOS DE GUARDA-REDES
// ==========================================
function renderTreinos() {
  const eligibleGKs = (state.gkRoster || []).filter(p => p.active !== false);

  if (trainingForm) { 
    const reasons = [
      { id: 'injustificada', label: '🔴 Injustificada' },
      { id: 'justificada', label: '🟡 Justificada' },
      { id: 'atrasado', label: '🕐 Atrasado' },
      { id: 'lesao', label: '🩹 Lesão / Médico' },
      { id: 'dispensado', label: '⚪ Dispensado' }
    ];

    const baseDuration = parseInt(trainingForm.duration, 10) || 90;
    
    // Controlador de tempo visual
    const usedTime = (trainingForm.exercises || []).reduce((acc, ex) => acc + (parseInt(ex.duration, 10) || 0), 0);
    const timeDiff = baseDuration - usedTime;
    
    let timeHtml = '';
    if (trainingForm.exercises && trainingForm.exercises.length > 0) {
        let timeMsg = '';
        let timeColor = '';
        if (timeDiff > 0) {
            timeMsg = `⏳ Faltam preencher ${timeDiff} min`;
            timeColor = 'var(--yellow)';
        } else if (timeDiff < 0) {
            timeMsg = `⚠️ Excede ${Math.abs(timeDiff)} min do total!`;
            timeColor = 'var(--red)';
        } else {
            timeMsg = `✅ Tempo exato da Sessão`;
            timeColor = 'var(--green)';
        }
        
        timeHtml = `
        <div style="background:var(--surface); border:1px solid ${timeColor}; border-radius:6px; padding:8px 10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; animation: fadeIn 0.3s ease;">
            <span style="font-size:11px; font-weight:bold; color:${timeColor};">${timeMsg}</span>
            <span style="font-size:10px; color:var(--muted); font-weight:bold;">Sessão: ${baseDuration}' | Usado: ${usedTime}'</span>
        </div>`;
    }

    return `
      <div style="padding: 0 16px;">
      <h2 style="font-size:16px; color:var(--gold); margin-bottom:12px;">${trainingForm.id ? '✏️ Editar Treino' : '➕ Novo Treino de GR'}</h2>
      
      <div class="card" style="margin:0 0 14px 0;">
        <div style="display:flex; gap:10px;">
          <div class="field" style="flex:1; margin-bottom:0;"><label>Data</label><input type="date" value="${trainingForm.date}" onchange="trainingForm.date=this.value; render();"></div>
          <div class="field" style="flex:1; margin-bottom:0;"><label>Duração (Min)</label><input type="number" value="${trainingForm.duration || 90}" onchange="trainingForm.duration=parseInt(this.value,10)||90; render();"></div>
        </div>

        <div style="margin-top:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <label style="font-size:11px; color:var(--chalk); font-weight:bold; text-transform:uppercase; margin:0;">🏋️ Exercícios do Caderno</label>
                <button class="btn btn-gold" style="flex:none; width:auto; font-size:10px; padding:4px 8px;" onclick="window.openExerciseSelectorModal()">➕ Importar</button>
            </div>
            
            ${timeHtml}

            ${(trainingForm.exercises && trainingForm.exercises.length > 0) ? `
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
                ${trainingForm.exercises.map((ex, idx) => `
                    <div style="background:var(--surface-2); border:1px solid var(--line); border-radius:8px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <div style="font-size:12px; font-weight:bold; color:var(--chalk);">${idx + 1}. ${escapeHTML(ex.name)}</div>
                        <div style="font-size:10px; color:var(--muted); display:flex; align-items:center; gap:6px; margin-top:4px;">
                        <span>Duração:</span>
                        <input type="number" value="${ex.duration}" style="width:45px; padding:2px 4px; font-size:11px; text-align:center; background:var(--surface); border:1px solid var(--gold); color:var(--gold); font-weight:bold; border-radius:4px;" onchange="window.updateExerciseDurationInTraining(${idx}, this.value)">
                        <span>Min</span>
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="window.viewExerciseScheme('${ex.notebookId}')">👁️ Ver</button>
                        <button class="quick-del" style="color:var(--red); font-size:14px; padding:4px 8px;" onclick="window.removeExerciseFromTraining(${idx})">🗑️</button>
                    </div>
                    </div>
                `).join('')}
                </div>
            ` : `<div style="font-size:10px; color:var(--muted); margin-top:12px; margin-bottom:12px;">Nenhum exercício importado.</div>`}

            <div class="field" style="margin-top:12px;">
                <label>🏋️‍♂️ Plano de Treino / Notas Livres</label>
                <textarea placeholder="Ex: 1. Aquecimento Específico; 2. Quedas laterais..." oninput="trainingForm.plan=this.value" style="min-height:80px;">${escapeHTML(trainingForm.plan || '')}</textarea>
            </div>
        </div>
      </div>

      <div class="card" style="margin:0 0 14px 0;">
        <div style="font-size:12px; font-weight:bold; color:var(--gold); margin-bottom:10px;">Presenças dos Guarda-Redes</div>
        
        ${eligibleGKs.length ? `<div style="display:flex; flex-direction:column; gap:8px;">${eligibleGKs.map(p => {
          const currentReason = (trainingForm.absences && trainingForm.absences[p.id]) || 'presente';
          
          return `<div style="display:flex; flex-direction:column; background:var(--surface-2); padding:10px 12px; border-radius:8px; gap:6px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size:13px; font-weight:bold; color:var(--chalk);">${p.number ? p.number + ' - ' : ''}${escapeHTML(p.name)}</span>
              <select style="width:auto; padding:4px 8px; font-size:11px; font-weight:bold; background:var(--surface); border:1px solid var(--line); color:var(--chalk); border-radius:6px;" onchange="window.setAbsenceReason('${p.id}', this.value)">
                <option value="presente" ${currentReason==='presente'?'selected':''}>🟢 Presente</option>
                ${reasons.map(r => `<option value="${r.id}" ${currentReason===r.id?'selected':''}>${r.label}</option>`).join('')}
              </select>
            </div>
          </div>`;
        }).join('')}</div>` : `<div class="empty" style="padding:10px;">Nenhum Guarda-Redes no plantel.</div>`}
      </div>
      
      <div style="display:flex; gap:10px; margin-bottom:20px;">
          <button class="btn btn-outline" style="flex:1;" onclick="trainingForm=null; render()">Cancelar</button>
          <button class="btn btn-gold" style="flex:1;" onclick="window.uiSaveTraining()">💾 Guardar Treino</button>
      </div>
      </div>`; 
  }
  
  const trs = (state.trainings || []).sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = `
    <div style="padding: 0 16px;">
        <button class="btn btn-gold" style="width:100%; margin-bottom:14px;" onclick="trainingForm={absences:{}, exercises:[], plan:'', duration:90, date: new Date().toISOString().slice(0,10)}; render()">➕ REGISTAR NOVO TREINO</button>
        <div style="display:flex; flex-direction:column; gap:10px;">
  `;
  
  if (trs.length === 0) {
      html += `<div class="empty">Nenhum treino de GR registado.</div>`;
  } else {
      trs.forEach(tr => {
          const open = expandedTraining === tr.id; 
          
          let absObj = tr.absences || {};
          if (Array.isArray(tr.absences)) { absObj = {}; tr.absences.forEach(id => absObj[id] = 'injustificada'); }
          const absKeys = Object.keys(absObj);
          const presCount = eligibleGKs.length - absKeys.length;
          
          html += `
          <div class="card" style="margin:0; padding:12px; cursor:pointer;" onclick="if(!event.target.closest('button')) { expandedTraining = expandedTraining === '${tr.id}' ? null : '${tr.id}'; render(); }">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:${open ? '12px' : '0'};">
                <div>
                    <div style="font-weight:bold; color:var(--chalk); font-size:14px; display:flex; align-items:center; gap:6px;">
                        ${tr.date.split('-').reverse().join('/')}
                    </div>
                    <div style="font-size:11px; color:var(--muted); margin-top:4px;">
                        ${presCount} presentes · ${absKeys.length} faltas · ${tr.duration || 90} Min
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline" style="padding:6px; font-size:12px;" onclick="event.stopPropagation(); window.editTraining('${tr.id}')">✏️</button>
                    <button class="btn btn-outline" style="padding:6px; font-size:12px; color:var(--red); border-color:var(--red);" onclick="event.stopPropagation(); window.deleteTraining('${tr.id}')">🗑️</button>
                </div>
            </div>
            
            ${open ? `
                <div style="border-top:1px dashed var(--line); padding-top:12px; animation: fadeIn 0.2s ease-in-out;">

                    ${tr.plan ? `
                        <div style="font-size:11px; color:var(--gold); font-weight:bold; text-transform:uppercase; margin-bottom:4px;">📝 Plano / Notas:</div>
                        <div style="font-size:12px; color:var(--chalk); margin-bottom:14px; white-space:pre-wrap;">${escapeHTML(tr.plan)}</div>
                    ` : ''}

                    ${tr.exercises && tr.exercises.length > 0 ? `
                        <div style="font-size:11px; color:var(--gold); font-weight:bold; text-transform:uppercase; margin-bottom:6px;">🏋️ Exercícios (${tr.exercises.length}):</div>
                        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:14px;">
                            ${tr.exercises.map((ex, i) => `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); padding:8px 10px; border-radius:6px;">
                                    <span style="font-size:12px; color:var(--chalk);"><b>${i+1}.</b>${escapeHTML(ex.name)} <span style="color:var(--muted);">(${ex.duration}')</span></span>
                                    <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="event.stopPropagation(); window.viewExerciseScheme('${ex.notebookId}')">👁️ Ver</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div style="font-size:11px; color:var(--gold); font-weight:bold; text-transform:uppercase; margin-bottom:6px;">👥 Ausências Registadas:</div>
                    ${absKeys.length > 0 ? `
                        <div style="font-size:12px; color:var(--chalk);">
                            ${absKeys.map(id => {
                                const p = eligibleGKs.find(x => x.id === id);
                                const name = p ? p.name : 'Desconhecido';
                                const reasonMap = { 'injustificada': '🔴 Injustificada', 'justificada': '🟡 Justificada', 'atrasado': '🕐 Atrasado', 'lesao': '🩹 Lesão', 'dispensado': '⚪ Dispensado' };
                                const r = reasonMap[absObj[id]] || absObj[id];
                                return `<div style="margin-bottom:4px;">• <b>${escapeHTML(name)}</b>:${r}</div>`;
                            }).join('')}
                        </div>
                    ` : `<div style="font-size:11px; color:var(--muted);">Nenhuma falta registada (Todos presentes).</div>`}
                </div>
            ` : ''}
          </div>`;
      });
  }
  
  html += `</div></div>`;
  return html;
}

// ==========================================
// 3. BIBLIOTECA DE VÍDEOS
// ==========================================
function renderVideos() {
    if (!state.videos) state.videos = [];

    if (window.videoForm) {
        return `
        <div style="padding: 0 16px;">
            <h2 style="font-size:16px; color:var(--gold); margin-bottom:12px;">${window.videoForm.id ? '✏️ Editar Vídeo' : '➕ Novo Vídeo'}</h2>
            <div class="card">
                <div class="field">
                    <label>Título do Exercício / Vídeo</label>
                    <input type="text" id="vid-title" value="${escapeHTML(window.videoForm.title || '')}" placeholder="Ex: Saída sob pressão">
                </div>
                <div class="field">
                    <label>Link (URL do YouTube / Instagram)</label>
                    <input type="url" id="vid-url" value="${escapeHTML(window.videoForm.url || '')}" placeholder="https://...">
                </div>
                <div class="field">
                    <label>Descrição / Notas</label>
                    <textarea id="vid-notes" placeholder="Ex: Prestar atenção ao apoio do pé...">${escapeHTML(window.videoForm.notes || '')}</textarea>
                </div>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <button class="btn btn-outline" style="flex:1;" onclick="window.videoForm=null; render()">Cancelar</button>
                <button class="btn btn-gold" style="flex:1;" onclick="window.uiSaveVideo()">💾 Guardar</button>
            </div>
        </div>`;
    }

    let html = `
    <div style="padding: 0 16px;">
        <button class="btn btn-gold" style="width:100%; margin-bottom:14px;" onclick="window.videoForm={title:'', url:'', notes:''}; render()">➕ GUARDAR NOVO VÍDEO</button>
        <div style="display:flex; flex-direction:column; gap:10px;">
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
    return html;
}

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
    window.askConfirm('Apagar este vídeo da biblioteca?', () => {
        state.videos = state.videos.filter(v => v.id !== id);
        saveState();
        render();
        if(typeof showToast === 'function') showToast('🗑️ Vídeo apagado!');
    }, 'btn-red');
};

// ==========================================
// FUNÇÕES GLOBAIS DE TREINO E PDF
// ==========================================
window.uiSaveTraining = function() {
  if (!trainingForm) return;

  const date = trainingForm.date || new Date().toISOString().slice(0, 10);
  const duration = parseInt(trainingForm.duration, 10) || 90;
  const plan = trainingForm.plan || '';
  const exercises = trainingForm.exercises ? JSON.parse(JSON.stringify(trainingForm.exercises)) : [];
  const absencesObj = trainingForm.absences ? { ...trainingForm.absences } : {};

  if (!state.trainings) state.trainings = [];

  if (trainingForm.id) {
    const idx = state.trainings.findIndex(t => t.id === trainingForm.id);
    if (idx !== -1) {
      state.trainings[idx] = { ...state.trainings[idx], date, duration, plan, exercises, absences: absencesObj };
    }
  } else {
    state.trainings.push({ id: uid(), season: state.currentSeason, date, duration, plan, exercises, absences: absencesObj });
  }

  trainingForm = null;
  saveState();
  render();
  if(typeof showToast === 'function') showToast('✅ Treino guardado com sucesso!');
};

window.editTraining = function(trId) {
  const tr = state.trainings.find(t => t.id === trId);
  if (!tr) return;
  
  trainingForm = {
    id: tr.id,
    date: tr.date,
    duration: tr.duration || 90,
    plan: tr.plan || '',
    exercises: tr.exercises ? JSON.parse(JSON.stringify(tr.exercises)) : [], 
    absences: Array.isArray(tr.absences) ? tr.absences.reduce((acc, id) => { acc[id] = 'injustificada'; return acc; }, {}) : (tr.absences ? { ...tr.absences } : {})
  };
  
  window.planTab = 'treinos';
  render();
};

window.deleteTraining = function(id) { 
    window.askConfirm('Apagar definitivamente este treino?', () => {
        state.trainings = state.trainings.filter(t=>t.id!==id); 
        saveState(); 
        render(); 
        if(typeof showToast === 'function') showToast('🗑️ Treino apagado!');
    }, 'btn-red');
};

window.setAbsenceReason = function(pId, reason) {
  if(!trainingForm.absences) trainingForm.absences = {};
  if(reason === 'presente') {
    delete trainingForm.absences[pId];
  } else {
    trainingForm.absences[pId] = reason;
  }
};

window.openExerciseSelectorModal = function() {
    window.exerciseSearchQuery = '';
    window.modalConfig = { type: 'exerciseSelector' };
    const root = document.getElementById('modal-root');
    if (root && typeof renderModalHTML === 'function') root.innerHTML = renderModalHTML();
};

window.addExerciseToTraining = function(exerciseId, customDur = 15) {
    if (!trainingForm) return;
    const play = (state.tacticalNotebook || []).find(x => x.id === exerciseId);
    if (!play) return;

    if (!trainingForm.exercises) trainingForm.exercises = [];
    const exDuration = parseInt(customDur, 10) || play.duration || 15;
    
    trainingForm.exercises.push({
        id: uid(), notebookId: play.id, name: play.name, notes: play.notes || "", duration: exDuration
    });

    if (typeof window.closeModal === 'function') window.closeModal();
    render();
};

window.updateExerciseDurationInTraining = function(index, newMins) {
    if (!trainingForm || !trainingForm.exercises || !trainingForm.exercises[index]) return;
    const val = parseInt(newMins, 10);
    trainingForm.exercises[index].duration = isNaN(val) || val <= 0 ? 15 : val;
    render();
};

window.removeExerciseFromTraining = function(index) {
    if (!trainingForm || !trainingForm.exercises) return;
    trainingForm.exercises.splice(index, 1);
    render();
};

window.viewExerciseScheme = function(notebookId) {
    const play = (state.tacticalNotebook || []).find(x => x.id === notebookId);
    if (!play) {
        if (typeof showToast === 'function') showToast('Esquema tático não encontrado.');
        return;
    }
    
    const isHalf = !!play.halfPitch;
    const teamColor = state.teamColor || '#D9A441';
    const oppColor = state.oppColor || '#C8493F';
    const coneColor = '#FF9500'; 
    const getConstrast = typeof getContrastColor === 'function' ? getContrastColor : () => '#000';

    let piecesSVG = '';
    (play.tactics || []).forEach(p => {
        let bg = p.kind === 'own' ? teamColor : (p.kind === 'opp' ? oppColor : coneColor);
        let color = p.kind === 'own' ? getConstrast(teamColor) : getConstrast(oppColor);
        
        const cx = Number.isFinite(Number(p.x)) ? Number(p.x) : 50;
        const cy = Number.isFinite(Number(p.y)) ? Number(p.y) : 50;
        const svgY = (cy / 100) * 75;

        if (['cone', 'minigoal', 'pole', 'rope', 'ball', 'mannequin', 'rebounder', 'ring'].includes(p.kind)) {
            let svgContent = '';
            if (p.kind === 'ball') {
                svgContent = `
                    <circle cx="0" cy="0" r="8" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/>
                    <path d="M 0 -3.5 L 3 -1.5 L 2 2.5 L -2 2.5 L -3 -1.5 Z" fill="#000000" />
                    <path d="M 0 -3.5 L 0 -8 M 3 -1.5 L 7.5 -2.5 M 2 2.5 L 4.5 7 M -2 2.5 L -4.5 7 M -3 -1.5 L -7.5 -2.5" stroke="#000000" stroke-width="1.2"/>
                `;
            } else {
                svgContent = typeof getTacticItemSVG === 'function' ? getTacticItemSVG(p) : '';
            }
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
    (play.tacticPaths || []).forEach(path => {
        if (!path.points || path.points.length === 0) return;
        const pts = path.points.map(pt => `${pt.x},${(pt.y / 100) * 75}`).join(' ');
        pathsSVG += `<polyline points="${pts}" fill="none" stroke="${path.color}" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" />`;
    });

    const svgHTML = `
        <div style="width:100%; aspect-ratio:4/3; background:#113821; border-radius:6px; overflow:hidden; position:relative; border: 2px solid #FFF;">
          <svg viewBox="0 0 100 75" style="width:100%; height:100%; display:block;">
            ${typeof getPitchSVG === 'function' ? getPitchSVG(isHalf) : ''}
            ${pathsSVG}
            ${piecesSVG}
          </svg>
        </div>`;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
      <div class="modal-card" style="max-width:440px; padding:20px; max-height: 90vh; overflow-y: auto;">
        <h3 style="margin-top:0; color:var(--gold); margin-bottom:12px; font-size:16px;">${escapeHTML(play.name)}</h3>
        ${svgHTML}
        ${play.notes ? `
          <div style="margin-top:16px;">
            <div style="font-size:11px; color:var(--gold); font-weight:bold; text-transform:uppercase; margin-bottom:4px;">📝 Descrição do Exercício:</div>
            <div style="font-size:12px; color:var(--chalk); background:var(--surface-2); padding:10px; border-radius:6px; border:1px solid var(--line); white-space:pre-wrap; line-height:1.4;">${escapeHTML(play.notes)}</div>
          </div>
        ` : `
          <div style="font-size:11px; color:var(--muted); margin-top:12px; font-style:italic;">Sem descrição guardada.</div>
        `}
        <button class="btn btn-outline" style="width:100%; margin-top:20px;" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
      </div>
    `;
    
    document.body.appendChild(modal);
};

window.getPlaySVG = function(notebookId) {
    const play = (state.tacticalNotebook || []).find(x => x.id === notebookId);
    if (!play) return '';
    const isHalf = !!play.halfPitch;
    const teamColor = state.teamColor || '#D9A441';
    const oppColor = state.oppColor || '#C8493F';
    const coneColor = '#FF9500';
    const getConstrast = typeof getContrastColor === 'function' ? getContrastColor : () => '#000';

    let piecesSVG = '';
    (play.tactics || []).forEach(p => {
        let bg = p.kind === 'own' ? teamColor : (p.kind === 'opp' ? oppColor : coneColor);
        let color = p.kind === 'own' ? getConstrast(teamColor) : getConstrast(oppColor);
        const cx = Number.isFinite(Number(p.x)) ? Number(p.x) : 50;
        const cy = Number.isFinite(Number(p.y)) ? Number(p.y) : 50;
        const svgY = (cy / 100) * 75;

        if (['cone', 'minigoal', 'pole', 'rope', 'ball', 'mannequin', 'rebounder', 'ring'].includes(p.kind)) {
            let svgContent = '';
            if (p.kind === 'ball') {
                svgContent = `<circle cx="0" cy="0" r="8" fill="#FFFFFF" stroke="#000000" stroke-width="1.2"/><path d="M 0 -3.5 L 3 -1.5 L 2 2.5 L -2 2.5 L -3 -1.5 Z" fill="#000000" /><path d="M 0 -3.5 L 0 -8 M 3 -1.5 L 7.5 -2.5 M 2 2.5 L 4.5 7 M -2 2.5 L -4.5 7 M -3 -1.5 L -7.5 -2.5" stroke="#000000" stroke-width="1.2"/>`;
            } else {
                svgContent = typeof getTacticItemSVG === 'function' ? getTacticItemSVG(p) : '';
            }
            piecesSVG += `<g transform="translate(${cx}, ${svgY}) scale(0.22)">${svgContent}</g>`;
        } else {
            let label = escapeHTML(p.label || '');
            piecesSVG += `<circle cx="${cx}" cy="${svgY}" r="2.2" fill="${bg}" stroke="#FFF" stroke-width="0.3" /><text x="${cx}" y="${svgY + 0.7}" fill="${color}" font-size="2" font-weight="bold" font-family="sans-serif" text-anchor="middle">${label}</text>`;
        }
    });

    let pathsSVG = '';
    (play.tacticPaths || []).forEach(path => {
        if (!path.points || path.points.length === 0) return;
        const pts = path.points.map(pt => `${pt.x},${(pt.y / 100) * 75}`).join(' ');
        pathsSVG += `<polyline points="${pts}" fill="none" stroke="${path.color}" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" />`;
    });

    return `<svg viewBox="0 0 100 75" style="width:100%; display:block; background:#113821; border:2px solid #000; border-radius:4px; box-sizing:border-box;">
        ${typeof getPitchSVG === 'function' ? getPitchSVG(isHalf) : ''}
        ${pathsSVG}
        ${piecesSVG}
    </svg>`;
};

window.openMesocicloModal = function() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'mesociclo-modal';
    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="modal-card" style="max-width:420px;">
            <h3 style="color:var(--gold); text-align:center; margin-top:0;">📄 Relatório de Mesociclo</h3>
            <p style="font-size:11px; color:var(--muted); text-align:center; margin-bottom:16px;">
                Gera um documento PDF limpo com todos os Treinos e Jogos no intervalo selecionado.
            </p>

            <div style="display:flex; gap:10px; margin-bottom:12px;">
                <div class="field" style="flex:1; margin-bottom:0;">
                    <label>Data Inicial</label>
                    <input type="date" id="meso-start" value="${firstDay}">
                </div>
                <div class="field" style="flex:1; margin-bottom:0;">
                    <label>Data Final</label>
                    <input type="date" id="meso-end" value="${lastDay}">
                </div>
            </div>

            <div style="background:var(--surface-2); padding:10px; border-radius:8px; border:1px solid var(--line); margin-bottom:16px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--chalk); cursor:pointer;">
                    <input type="checkbox" id="meso-include-exercises" checked style="width:16px; height:16px; accent-color:var(--gold);">
                    Incluir imagens dos esquemas táticos
                </label>
            </div>

            <div style="display:flex; gap:10px;">
                <button class="btn btn-outline" style="flex:1;" onclick="document.getElementById('mesociclo-modal').remove()">Cancelar</button>
                <button class="btn btn-gold" style="flex:1;" onclick="window.generateMesocicloPDF()">🖨️ Gerar PDF</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.generateMesocicloPDF = function() {
    const start = document.getElementById('meso-start').value;
    const end = document.getElementById('meso-end').value;
    const includeExercises = document.getElementById('meso-include-exercises').checked;

    if (!start || !end) {
        if(typeof showToast === 'function') showToast("Preenche ambas as datas!");
        return;
    }

    if (start > end) {
        if(typeof showToast === 'function') showToast("Data final deve ser maior que a inicial!");
        return;
    }

    const trs = (state.trainings || []).filter(t => t.date >= start && t.date <= end).map(t => ({...t, type: 'treino'}));
    const mats = (state.gkMatches || []).filter(m => m.date >= start && m.date <= end).map(m => ({...m, type: 'jogo'}));

    let timeline = [...trs, ...mats].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (timeline.length === 0) {
        if(typeof showToast === 'function') showToast("Sem treinos ou jogos nesse período!");
        return;
    }

    const logoHtml = state.clubLogo
        ? `<img src="${state.clubLogo}" style="height:50px; width:auto; object-fit:contain;">`
        : `<div style="font-size:40px; opacity:0.3;">🛡️</div>`;

    let html = `
        <div style="font-family:Arial, sans-serif; padding:20px; background:#fff; color:#000; max-width:1000px; margin:0 auto;">
            
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #D9A441; padding-bottom:12px; margin-bottom:20px;">
                <div>
                    <h1 style="color:#0E211A; margin:0; font-size:22px; text-transform:uppercase; font-weight:900;">RELATÓRIO DE MESOCICLO</h1>
                    <p style="color:#8FA79B; margin:4px 0 0 0; font-size:12px; font-weight:bold;">Período: ${start.split('-').reverse().join('/')} a ${end.split('-').reverse().join('/')}</p>
                    <p style="color:#8FA79B; margin:2px 0 0 0; font-size:11px;">Equipa: ${state.myClubName || 'N/A'} | Época: ${state.currentSeason}</p>
                </div>
                ${logoHtml}
            </div>

            <div style="display:flex; gap:12px; margin-bottom:20px;">
                <div style="background:#F3F4F6; padding:10px 16px; border-radius:8px; border:1px solid #E5E7EB;">
                    <div style="font-size:10px; color:#6B7280; text-transform:uppercase; font-weight:bold;">Total de Treinos</div>
                    <div style="font-size:18px; font-weight:bold; color:#0E211A;">${trs.length}</div>
                </div>
                <div style="background:#F3F4F6; padding:10px 16px; border-radius:8px; border:1px solid #E5E7EB;">
                    <div style="font-size:10px; color:#6B7280; text-transform:uppercase; font-weight:bold;">Total de Jogos</div>
                    <div style="font-size:18px; font-weight:bold; color:#0E211A;">${mats.length}</div>
                </div>
            </div>

            <!-- GRELHA DE EVENTOS (LADO A LADO) -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
    `;

    timeline.forEach(item => {
        const dateStr = item.date.split('-').reverse().join('/');

        if (item.type === 'jogo') {
            const result = item.result ? `${item.result.us} - ${item.result.them}` : 'S/R';
            const isWin = item.result && item.result.us > item.result.them;
            const isLoss = item.result && item.result.us < item.result.them;
            const resColor = isWin ? '#16A34A' : (isLoss ? '#DC2626' : '#D9A441');

            html += `
                <div style="border:1px solid #E5E7EB; border-top:4px solid #D9A441; border-radius:8px; padding:14px; background:#FAFAFA; page-break-inside:avoid;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div style="font-size:10px; color:#D9A441; font-weight:bold; text-transform:uppercase;">⚽ COMPETIÇÃO / PREPARAÇÃO</div>
                            <div style="font-size:16px; font-weight:bold; color:#0E211A; margin-top:2px;">vs ${escapeHTML(item.opponent)}</div>
                            <div style="font-size:11px; color:#6B7280; margin-top:2px;">${dateStr} • ${item.location === 'casa' ? 'Casa' : 'Fora'}</div>
                        </div>
                        <div style="font-size:22px; font-weight:bold; color:${resColor}; background:#fff; padding:4px 10px; border:1px solid #E5E7EB; border-radius:6px;">
                            ${result}
                        </div>
                    </div>
                    ${item.notes ? `
                        <div style="font-size:11px; color:#374151; background:#fff; border:1px solid #E5E7EB; padding:8px; border-radius:4px; font-style:italic;">
                            <b>Notas:</b> ${escapeHTML(item.notes)}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            html += `
                <div style="border:1px solid #E5E7EB; border-top:4px solid #16A34A; border-radius:8px; padding:14px; background:#FAFAFA; page-break-inside:avoid;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div style="font-size:10px; color:#16A34A; font-weight:bold; text-transform:uppercase;">🏋️ TREINO DE GR</div>
                            <div style="font-size:14px; font-weight:bold; color:#0E211A; margin-top:2px;">${dateStr}</div>
                        </div>
                        <div style="font-size:14px; font-weight:bold; color:#6B7280;">
                            ${item.duration}'
                        </div>
                    </div>

                    ${item.plan ? `
                        <div style="font-size:11px; color:#1F2937; margin-bottom:12px; white-space:pre-wrap; line-height:1.4;"><b>Plano/Notas:</b><br>${escapeHTML(item.plan)}</div>
                    ` : ''}

                    ${(includeExercises && item.exercises && item.exercises.length > 0) ? `
                        <div style="border-top:1px dashed #D1D5DB; padding-top:10px; display:flex; flex-direction:column; gap:10px;">
                            <div style="font-size:10px; color:#4B5563; font-weight:bold; text-transform:uppercase;">Exercícios Planeados:</div>
                            ${item.exercises.map(ex => {
                                const svgString = window.getPlaySVG(ex.notebookId);
                                return `
                                    <div style="display:flex; gap:10px; align-items:center; background:#fff; border:1px solid #E5E7EB; padding:8px; border-radius:6px; page-break-inside:avoid;">
                                        ${svgString ? `<div style="flex-shrink:0; width:100px;">${svgString}</div>` : ''}
                                        <div style="flex:1;">
                                            <div style="font-size:11px; font-weight:bold; color:#0E211A; margin-bottom:4px;">${escapeHTML(ex.name)} <span style="color:#6B7280; font-weight:normal;">(${ex.duration}')</span></div>
                                            ${ex.notes ? `<div style="font-size:9px; color:#4B5563; line-height:1.3; font-style:italic;">${escapeHTML(ex.notes)}</div>` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    });

    html += `
            </div>
            <div style="text-align:center; font-size:9px; color:#9CA3AF; margin-top:20px; border-top:1px solid #E5E7EB; padding-top:10px;">
                CoachFolio GK Pro — Gerado em ${new Date().toLocaleString('pt-PT')}
            </div>
        </div>
    `;

    const printArea = document.getElementById('print-area');
    if (printArea) {
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
    }

    document.getElementById('mesociclo-modal').remove();
};