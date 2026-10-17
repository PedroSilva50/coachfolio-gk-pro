const STORAGE_KEY = 'coach-gk-pro-data-v1';
const usingClaudeStorage = (typeof window.storage !== 'undefined');

const storageAdapter = {
  async get(key) {
    if (usingClaudeStorage) {
      try { return await window.storage.get(key); } catch(e) { return null; }
    } else {
      const v = localStorage.getItem(key);
      return v ? { key, value: v } : null;
    }
  },
  async set(key, value) {
    if (usingClaudeStorage) return await window.storage.set(key, value);
    else { localStorage.setItem(key, value); return { key, value }; }
  }
};

let saveTimeout = null;

function saveState() {
  if (typeof IS_LICENSED !== 'undefined' && !IS_LICENSED) return Promise.resolve();
  state.schemaVersion = 1;
  state.lastBackupDate = Date.now();
  
  if (saveTimeout) clearTimeout(saveTimeout);
  return new Promise(resolve => {
    saveTimeout = setTimeout(async () => {
      try {
        await storageAdapter.set(STORAGE_KEY, JSON.stringify(state));
      } catch(e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || (e.message && e.message.includes('quota'))) {
          alert('Espaço Esgotado! O telemóvel não tem memória.');
        } else {
          console.error("Erro ao guardar estado:", e);
        }
      }
      resolve();
    }, 300);
  });
}

async function loadState() {
  try {
    if (typeof IS_LICENSED !== 'undefined' && !IS_LICENSED) return;
    const res = await storageAdapter.get(STORAGE_KEY);
    
    if (res && res.value) {
      state = JSON.parse(res.value);
      
      // Direitos adquiridos
      if (!state.isActivated && ((state.gkMatches && state.gkMatches.length > 0) || (state.gkRoster && state.gkRoster.length > 0))) {
        state.isActivated = true;
      }
      
      // Normalização de dados GK Pro
      if (!state.schemaVersion) state.schemaVersion = 1;
      if (state.isActivated === undefined) state.isActivated = false;
      
      // Estrutura GK Pro
      if (!state.gkRoster) state.gkRoster = [];
      if (!state.gkMatches) state.gkMatches = [];
      if (!state.gkEvaluations) state.gkEvaluations = [];
      
      // Manter compatibilidade com planeamento
      if (!state.trainings) state.trainings = [];
      if (!state.schedule) state.schedule = [];
      if (!state.tactics) state.tactics = [];
      
      // Configurações
      if (!state.sport) state.sport = 'futebol'; // 'futebol' ou 'futsal'
      if (!state.tacticFormat) state.tacticFormat = 11;
      if (state.trackSubs === undefined) state.trackSubs = true;
      if (state.defaultHalfDuration === undefined) state.defaultHalfDuration = 45;
      if (!state.teamColor) state.teamColor = '#D9A441';
      if (!state.oppColor) state.oppColor = '#C8493F';
      if (!state.theme) state.theme = 'original';
      if (!state.lang) state.lang = 'pt';
      if (!state.myClubName) state.myClubName = '';
      if (!state.escalao) state.escalao = '';
      if (!state.currentSeason) state.currentSeason = '25/26';
      
      // Normalizar GR no plantel
      state.gkRoster.forEach(p => {
        if (!p.foot) p.foot = 'Destro';
        if (p.height === undefined) p.height = null;
        if (p.weight === undefined) p.weight = null;
        if (!p.skills) p.skills = { technique: 3, decision: 3, positioning: 3, mentality: 3 };
      });
      
    } else {
      state.currentSeason = '25/26';
    }
  } catch(e) {
    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#0E211A; color:#F3EFE6; text-align:center; padding:20px; font-family:sans-serif;">
        <span style="font-size:50px; margin-bottom:20px;">️</span>
        <h2 style="color:#C8493F; margin:0 0 10px 0; text-transform:uppercase;">Falha de Leitura</h2>
        <p style="color:#8FA79B; font-size:14px; max-width:400px; line-height:1.5; margin-bottom:20px;">
          Ocorreu um erro a ler a base de dados. Para não perderes os registos, a aplicação foi bloqueada por precaução.
        </p>
        <button style="padding:12px 20px; background:var(--gold); border:none; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="window.location.reload()">Tentar Novamente</button>
      </div>
    `;
    throw new Error("Falha Crítica ao carregar dados.");
  }
  
  checkActivationAndRender();
}

// Sistema de Ativação
function verifyKey(identifier, key) {
  const _p = ['Q09B', 'Q0gy', 'Ng=='];
  const secret = atob(_p.join(''));
  const str = identifier.trim().toUpperCase() + secret;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const expected = Math.abs(hash).toString(16).toUpperCase().substring(0, 6);
  return key.trim().toUpperCase() === expected;
}

window.activateApp = function() {
  const idVal = document.getElementById('act-id').value;
  const kVal = document.getElementById('act-key').value;
  if (!idVal || !kVal) {
    showToast('Preenche os dois campos!');
    return;
  }
  if (verifyKey(idVal, kVal)) {
    state.isActivated = true;
    saveState();
    render();
  } else {
    showToast('Chave de Ativação Inválida!');
  }
};

function checkActivationAndRender() {
  if (state.isActivated) {
    render();
  } else {
    const nav = document.getElementById('navbar');
    if (nav) nav.style.display = 'none';
    render();
  }
}