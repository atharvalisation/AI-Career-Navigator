/* ── AI Career Navigator 2.0 – Frontend Logic ───────────────────────── */

const CAREER_COLORS = {
  "Data Scientist":    "#00d4ff",
  "Software Engineer": "#00ff9d",
  "Product Manager":   "#ff9f43",
  "Designer":          "#ff6b9d"
};

const CAREER_ICONS = {
  "Data Scientist":    "🔬",
  "Software Engineer": "💻",
  "Product Manager":   "📊",
  "Designer":          "🎨"
};

const FEATURE_LABELS = {
  CGPA:           { label: "CGPA",            icon: "🎓" },
  Coding:         { label: "Coding",          icon: "💻" },
  Communication:  { label: "Communication",   icon: "🗣️" },
  ProblemSolving: { label: "Problem Solving", icon: "🧩" },
  Creativity:     { label: "Creativity",      icon: "✨" },
  Leadership:     { label: "Leadership",      icon: "👑" },
  Projects:       { label: "Projects",        icon: "📁" }
};

let lastPrediction = null;
let whatifDebounce = null;

// ── Slider initialization ───────────────────────────────────────────────
function initSliders() {
  document.querySelectorAll('.slider').forEach(slider => {
    updateSlider(slider);
    slider.addEventListener('input', () => updateSlider(slider));
  });
}

function updateSlider(slider) {
  const id    = slider.id;
  const val   = parseFloat(slider.value);
  const max   = parseFloat(slider.max);
  const pct   = (val / max) * 100;

  const valEl  = document.getElementById(`val-${id}`);
  const fillEl = document.getElementById(`fill-${id}`);

  if (valEl) {
    valEl.textContent = Number.isInteger(val) ? val : val.toFixed(1);
  }
  if (fillEl) {
    fillEl.style.width = `${pct}%`;
  }
}

// ── Interest card toggling ──────────────────────────────────────────────
function initInterestCards() {
  document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.interest-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.querySelector('input[type=radio]').checked = true;
    });
  });
}

// ── Form collection ─────────────────────────────────────────────────────
function collectFormData() {
  const form = document.getElementById('career-form');
  const fd   = new FormData(form);
  return {
    CGPA:          parseFloat(document.getElementById('CGPA').value),
    Coding:        parseFloat(document.getElementById('Coding').value),
    Communication: parseFloat(document.getElementById('Communication').value),
    ProblemSolving:parseFloat(document.getElementById('ProblemSolving').value),
    Creativity:    parseFloat(document.getElementById('Creativity').value),
    Leadership:    parseFloat(document.getElementById('Leadership').value),
    Projects:      parseFloat(document.getElementById('Projects').value),
    Interest:      fd.get('Interest') || 'Tech'
  };
}

// ── API call ────────────────────────────────────────────────────────────
async function fetchPrediction(data) {
  const res = await fetch('/predict', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data)
  });
  return res.json();
}

// ── Main form submit ────────────────────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();
  const btn      = document.getElementById('predict-btn');
  const btnText  = btn.querySelector('.btn-text');
  const btnLoader= btn.querySelector('.btn-loader');

  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoader.classList.remove('hidden');

  try {
    const data   = collectFormData();
    const result = await fetchPrediction(data);

    if (!result.success) throw new Error(result.error || 'Prediction failed');

    lastPrediction = result;
    renderResults(result);
    syncWhatIfSliders(data);

  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
}

// ── Render all results ──────────────────────────────────────────────────
function renderResults(result) {
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('results-content').classList.remove('hidden');

  const careers = result.top_careers;
  const top     = careers[0];

  document.getElementById('result-subtitle').textContent =
    `${top.career} is your best match with ${Math.round(top.probability * 100)}% confidence`;

  renderCareerCards(careers);
  renderSkillAnalysis(careers);
  renderExplanations(careers);
  renderActionPlans(careers);
  renderGrowthPaths(careers);

  // Scroll to results (mobile)
  if (window.innerWidth <= 768) {
    document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Career cards ────────────────────────────────────────────────────────
function renderCareerCards(careers) {
  const container = document.getElementById('career-cards');
  container.innerHTML = '';

  careers.forEach((c, i) => {
    const color = CAREER_COLORS[c.career] || c.color;
    const pct   = Math.round(c.probability * 100);
    const ranks = ['1st', '2nd', '3rd'];

    const card = document.createElement('div');
    card.className = `career-card rank-${i + 1}`;
    card.style.setProperty('--card-color', color);
    card.innerHTML = `
      <div class="card-rank">
        <span class="rank-badge">${i + 1}</span>
        ${ranks[i]} Best Match
      </div>
      <div class="card-icon-row">
        <span class="card-icon">${c.icon}</span>
        <span class="card-title">${c.career}</span>
      </div>
      <p class="card-description">${c.description}</p>
      <div class="confidence-row">
        <span class="confidence-label">Confidence</span>
        <span class="confidence-value" style="color:${color}">${pct}%</span>
      </div>
      <div class="confidence-bar-track">
        <div class="confidence-bar-fill" data-pct="${pct}"
             style="background: linear-gradient(90deg, ${color}, ${color}88)"></div>
      </div>
      <div class="card-meta">
        ${c.industries.map(ind => `<span class="meta-chip">${ind}</span>`).join('')}
      </div>
    `;
    card.addEventListener('click', () => openCareerModal(c));
    container.appendChild(card);

    // Animate bar after DOM insert
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.querySelector('.confidence-bar-fill').style.width = `${pct}%`;
      });
    });
  });
}

// ── Skill analysis ──────────────────────────────────────────────────────
function renderSkillAnalysis(careers) {
  const container = document.getElementById('skill-grid');
  container.innerHTML = '';

  careers.forEach(c => {
    const color = CAREER_COLORS[c.career] || c.color;
    const gaps  = c.skill_gaps;

    const card = document.createElement('div');
    card.className = 'skill-card';
    card.innerHTML = `
      <div class="skill-card-header">
        <div class="skill-card-title">
          <span>${c.icon}</span>${c.career}
        </div>
        <span class="skill-card-badge"
              style="background: ${color}22; color: ${color}; border: 1px solid ${color}44">
          ${Math.round(c.probability * 100)}% match
        </span>
      </div>
      <div class="skill-rows" id="skill-rows-${c.career.replace(/\s/g,'-')}"></div>
    `;
    container.appendChild(card);

    const rowsEl = card.querySelector('.skill-rows');
    Object.entries(gaps).forEach(([feat, data]) => {
      const pctActual = (data.actual / 10) * 100;
      const pctIdeal  = (data.ideal / 10) * 100;
      const hasGap    = data.gap > 0.1;
      const label     = FEATURE_LABELS[feat]?.label || feat;
      const max       = feat === 'Projects' ? 5 : 10;
      const pctA      = (data.actual / max) * 100;
      const pctI      = (data.ideal  / max) * 100;

      const row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML = `
        <div class="skill-row-header">
          <span>${label}</span>
          <span class="skill-gap-label" style="color: ${hasGap ? '#ff4d6d' : '#00ff9d'}">
            ${hasGap ? `Gap: -${data.gap.toFixed(1)}` : '✓ Met'}
          </span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-actual" data-pct="${pctA}"
               style="background: ${hasGap ? color + '88' : color}; width:0"></div>
          <div class="skill-bar-ideal"
               style="left: calc(${pctI}% - 1px); background: ${color}"></div>
        </div>
      `;
      rowsEl.appendChild(row);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        row.querySelector('.skill-bar-actual').style.width = `${pctA}%`;
      }));
    });
  });
}

// ── AI Explanations ─────────────────────────────────────────────────────
function renderExplanations(careers) {
  const container = document.getElementById('explanation-cards');
  container.innerHTML = '';

  careers.forEach(c => {
    const color = CAREER_COLORS[c.career] || c.color;
    const pct   = Math.round(c.probability * 100);

    const card = document.createElement('div');
    card.className = 'explanation-card';
    card.innerHTML = `
      <div class="explanation-icon">${c.icon}</div>
      <div class="explanation-body">
        <div class="explanation-title">
          ${c.career}
          <span class="match-pill" style="background:${color}22; color:${color}; border:1px solid ${color}44">
            ${pct}% match
          </span>
        </div>
        <p class="explanation-text">${c.explanation}</p>
        <div class="explanation-skills">
          ${c.skills_needed.map(s => `<span class="skill-pill">${s}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ── Action plans ────────────────────────────────────────────────────────
function renderActionPlans(careers) {
  const container = document.getElementById('action-plan-list');
  container.innerHTML = '';

  careers.forEach(c => {
    const color = CAREER_COLORS[c.career] || c.color;

    const group = document.createElement('div');
    group.className = 'action-group';
    group.innerHTML = `
      <div class="action-group-header">
        <span class="action-group-icon">${c.icon}</span>
        <span class="action-group-title" style="color:${color}">${c.career} — Action Plan</span>
      </div>
      <div class="action-steps">
        ${c.action_plan.map((step, i) => `
          <div class="action-step">
            <span class="step-num" style="background:${color}22; color:${color}">${i + 1}</span>
            <span>${step}</span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(group);
  });
}

// ── Growth paths ─────────────────────────────────────────────────────────
function renderGrowthPaths(careers) {
  const container = document.getElementById('growth-paths');
  container.innerHTML = '';

  careers.forEach(c => {
    const color = CAREER_COLORS[c.career] || c.color;

    const card = document.createElement('div');
    card.className = 'growth-card';

    const stepsHtml = c.growth_path.map((step, i) => {
      const isCurrent = i === 1;
      const connector = i < c.growth_path.length - 1
        ? `<div class="growth-connector" style="background: ${color}44"></div>` : '';
      return `
        <div class="growth-step ${isCurrent ? 'current' : ''}" style="color:${color}">
          <div class="growth-step-circle"
               style="${isCurrent ? `border-color:${color}; background:${color}22; color:${color}; box-shadow: 0 0 12px ${color}44` : ''}">
            ${i + 1}
          </div>
          <span class="growth-step-label">${step}</span>
        </div>
        ${connector}
      `;
    }).join('');

    card.innerHTML = `
      <div class="growth-card-title" style="color:${color}">
        ${c.icon} ${c.career} Growth Path
      </div>
      <div class="growth-path-row">${stepsHtml}</div>
      <div class="salary-badge">
        💰 Typical range: ${c.avg_salary}
      </div>
    `;
    container.appendChild(card);
  });
}

// ── What-If Simulator ────────────────────────────────────────────────────
function syncWhatIfSliders(data) {
  const container = document.getElementById('whatif-sliders');
  container.innerHTML = '';

  const fields = ['Coding', 'Communication', 'ProblemSolving', 'Creativity', 'Leadership'];

  fields.forEach(feat => {
    const info  = FEATURE_LABELS[feat];
    const val   = data[feat];
    const max   = feat === 'Projects' ? 5 : 10;

    const group = document.createElement('div');
    group.className = 'wi-group';
    group.innerHTML = `
      <div class="wi-label">
        <span>${info.icon} ${info.label}</span>
        <span class="wi-val" id="wi-val-${feat}">${val.toFixed(1)}</span>
      </div>
      <input type="range" class="wi-slider" id="wi-${feat}"
             min="0" max="${max}" step="0.1" value="${val}" data-feat="${feat}" />
    `;
    container.appendChild(group);
  });

  container.querySelectorAll('.wi-slider').forEach(sl => {
    sl.addEventListener('input', onWhatIfChange);
  });

  renderWhatIfResults(lastPrediction.top_careers);
}

function onWhatIfChange(e) {
  const sl   = e.target;
  const feat = sl.dataset.feat;
  const val  = parseFloat(sl.value);

  const valEl = document.getElementById(`wi-val-${feat}`);
  if (valEl) valEl.textContent = val.toFixed(1);

  clearTimeout(whatifDebounce);
  whatifDebounce = setTimeout(async () => {
    const base = collectFormData();
    // Override with what-if values
    document.querySelectorAll('.wi-slider').forEach(s => {
      base[s.dataset.feat] = parseFloat(s.value);
    });

    try {
      const result = await fetchPrediction(base);
      if (result.success) renderWhatIfResults(result.top_careers);
    } catch (_) {}
  }, 300);
}

function renderWhatIfResults(careers) {
  const container = document.getElementById('whatif-results');
  container.innerHTML = '';

  const header = document.createElement('p');
  header.style.cssText = 'font-size:0.75rem; color: var(--text-muted); margin-bottom:10px;';
  header.textContent = 'Live prediction update:';
  container.appendChild(header);

  careers.forEach((c, i) => {
    const color = CAREER_COLORS[c.career] || c.color;
    const pct   = Math.round(c.probability * 100);

    const row = document.createElement('div');
    row.className = `wi-career-row ${i === 0 ? 'wi-top' : ''}`;
    row.innerHTML = `
      <span class="wi-career-icon">${c.icon}</span>
      <div class="wi-career-info">
        <div class="wi-career-name">${c.career}</div>
        <div class="wi-career-bar-track">
          <div class="wi-career-bar-fill" style="width:${pct}%; background:${color}"></div>
        </div>
      </div>
      <span class="wi-career-prob" style="color:${color}">${pct}%</span>
    `;
    container.appendChild(row);
  });
}

// ── Tabs ────────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
    });
  });
}

// ── What-If section toggle ───────────────────────────────────────────────
function initWhatIfToggle() {
  const toggle  = document.getElementById('whatif-toggle');
  const section = document.getElementById('whatif-section');

  toggle.addEventListener('click', () => {
    const isOpen = !section.classList.contains('hidden');
    if (isOpen) {
      section.classList.add('hidden');
      toggle.classList.remove('open');
    } else {
      if (!lastPrediction) {
        alert('Please run a prediction first.');
        return;
      }
      section.classList.remove('hidden');
      toggle.classList.add('open');
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ── Career modal ─────────────────────────────────────────────────────────
function openCareerModal(career) {
  const color     = CAREER_COLORS[career.career] || career.color;
  const pct       = Math.round(career.probability * 100);
  const modal     = document.getElementById('career-modal');
  const content   = document.getElementById('modal-content');
  const overlay   = document.getElementById('modal-overlay');

  content.innerHTML = `
    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:20px;">
      <div style="font-size:2.5rem">${career.icon}</div>
      <div>
        <h2 style="font-size:1.3rem; font-weight:800; color:${color}; margin-bottom:4px">${career.career}</h2>
        <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.6">${career.description}</p>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px">
      <div style="padding:12px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border)">
        <div style="font-size:0.68rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:.07em; margin-bottom:4px">Match Score</div>
        <div style="font-size:1.5rem; font-weight:800; color:${color}; font-family:var(--mono)">${pct}%</div>
      </div>
      <div style="padding:12px; background:var(--surface-2); border-radius:var(--radius-sm); border:1px solid var(--border)">
        <div style="font-size:0.68rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:.07em; margin-bottom:4px">Avg. Salary</div>
        <div style="font-size:0.95rem; font-weight:700; color:var(--green)">${career.avg_salary}</div>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <h3 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--text-muted); margin-bottom:8px">Key Skills</h3>
      <div style="display:flex; flex-wrap:wrap; gap:6px">
        ${career.skills_needed.map(s => `<span class="skill-pill" style="border-color:${color}44; color:${color}">${s}</span>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:16px">
      <h3 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--text-muted); margin-bottom:8px">Industries</h3>
      <div style="display:flex; flex-wrap:wrap; gap:6px">
        ${career.industries.map(ind => `<span class="meta-chip">${ind}</span>`).join('')}
      </div>
    </div>
    <div>
      <h3 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--text-muted); margin-bottom:8px">Top Action Steps</h3>
      ${career.action_plan.slice(0,3).map((s,i) => `
        <div style="display:flex; gap:8px; padding:8px; background:var(--surface-2); border-radius:6px; margin-bottom:6px; font-size:0.78rem; color:var(--text-muted)">
          <span style="color:${color}; font-weight:700; flex-shrink:0">${i+1}.</span> ${s}
        </div>`).join('')}
    </div>
  `;

  overlay.classList.remove('hidden');
}

function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.classList.add('hidden');
  });
}

// ── Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  initInterestCards();
  initTabs();
  initWhatIfToggle();
  initModal();

  document.getElementById('career-form').addEventListener('submit', handleFormSubmit);
});
